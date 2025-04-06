import cv2
import numpy as np
import tempfile
import os
import platform
from typing import List, Dict, Any, Optional, Tuple
import asyncio
from app.core.config import get_settings
from app.services.detector import detector
import base64
import time
import uuid
from redis.asyncio import Redis
import shutil
import json

settings = get_settings()

# 视频处理任务状态
class VideoTaskStatus:
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class VideoProcessor:
    def __init__(self):
        self.redis: Optional[Redis] = None
        
    async def get_redis(self) -> Redis:
        """获取Redis连接"""
        if self.redis is None:
            self.redis = Redis.from_url(settings.redis_url)
        return self.redis
    
    def get_platform_video_settings(self) -> Tuple[str, str, str]:
        """根据平台返回最佳视频设置: (文件扩展名, 编码器代码, MIME类型)"""
        system = platform.system()
        
        # 默认为最通用的MP4/H.264格式
        default = ('.mp4', 'mp4v', 'video/mp4')
        
        if system == "Windows":
            # Windows通常支持H.264
            return default
        elif system == "Linux":
            # 尝试几种Linux常用编码器
            try:
                # 尝试H.264
                temp_out = cv2.VideoWriter_fourcc(*'mp4v')
                return default
            except:
                try:
                    # XVID作为备选
                    temp_out = cv2.VideoWriter_fourcc(*'XVID')
                    return ('.avi', 'XVID', 'video/avi')
                except:
                    # MJPG作为最后选择
                    return ('.avi', 'MJPG', 'video/avi')
        elif system == "Darwin":  # macOS
            return default
            
        return default  # 其他系统使用默认设置
    
    async def create_task(self, video_bytes: bytes) -> str:
        """创建视频处理任务，返回任务ID"""
        try:
            task_id = str(uuid.uuid4())
            
            # 确保可以连接Redis
            try:
                redis = await self.get_redis()
                # 测试连接是否有效
                await redis.ping()
            except Exception as redis_error:
                print(f"Redis连接错误: {str(redis_error)}")
                raise Exception(f"无法连接到Redis服务: {str(redis_error)}")
            
            # 确保临时目录存在且可写
            temp_dir = tempfile.gettempdir()
            os.makedirs(os.path.join(temp_dir, "yolopest_videos"), exist_ok=True)
            
            # 保存视频到临时文件
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4', dir=os.path.join(temp_dir, "yolopest_videos")) as tmp:
                tmp.write(video_bytes)
                video_path = tmp.name
            
            # 验证视频文件
            try:
                cap = cv2.VideoCapture(video_path)
                if not cap.isOpened():
                    raise Exception(f"无法打开视频文件: {video_path}")
                cap.release()
            except Exception as video_error:
                os.unlink(video_path)
                print(f"视频验证失败: {str(video_error)}")
                raise Exception(f"视频格式无效或不受支持: {str(video_error)}")
            
            # 创建任务信息
            task_info = {
                "id": task_id,
                "status": VideoTaskStatus.PENDING,
                "video_path": video_path,
                "created_at": time.time(),
                "progress": 0
            }
            
            # 保存到Redis
            await redis.set(f"video_task:{task_id}", json.dumps(task_info))
            # 将任务添加到队列
            await redis.lpush("video_tasks_queue", task_id)
            
            # 启动后台任务处理
            asyncio.create_task(self._process_video(task_id))
            
            return task_id
        except Exception as e:
            import traceback
            stack_trace = traceback.format_exc()
            print(f"创建视频处理任务失败: {str(e)}\n{stack_trace}")
            raise
    
    async def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """获取任务状态"""
        try:
            # 先检查是否有结果文件
            result_file = os.path.join("app", "static", "videos", f"{task_id}_result.json")
            if os.path.exists(result_file):
                # 文件存在，表示任务已完成
                return {
                    "status": "completed",
                    "progress": 100,
                    "message": "处理完成",
                    "task_id": task_id
                }
            
            # 结果文件不存在，检查Redis中的状态
            redis = await self.get_redis()
            task_info = await redis.get(f"video_task:{task_id}")
            
            if task_info:
                return json.loads(task_info)
            
            # 都没有找到，返回未知状态
            return {"status": "unknown", "message": "任务状态未知"}
            
        except Exception as e:
            print(f"获取任务状态时出错: {str(e)}")
            return {"status": "error", "message": f"获取任务状态时出错: {str(e)}"}
    
    async def get_task_result(self, task_id: str) -> Dict[str, Any]:
        """获取任务结果"""
        try:
            # 优先尝试从文件系统获取结果
            result_file = os.path.join("app", "static", "videos", f"{task_id}_result.json")
            if os.path.exists(result_file):
                with open(result_file, 'r') as f:
                    result = json.load(f)
                    # 添加标准视频URL路径
                    result["annotated_video_url"] = f"/api/static/videos/{task_id}_annotated.mp4"
                    # 添加任务ID以便前端构建URL
                    result["task_id"] = task_id
                    return result
            
            # 如果文件不存在，再尝试从Redis获取
            redis = await self.get_redis()
            task_info = await redis.get(f"video_task:{task_id}")
            
            if task_info:
                return json.loads(task_info)
            
            # 都没有找到，返回错误状态
            return {"status": "not_found", "message": "未找到任务结果"}
            
        except Exception as e:
            print(f"获取结果时出错: {str(e)}")
            return {"status": "error", "message": f"获取结果时出错: {str(e)}"}
    
    async def _process_video(self, task_id: str):
        """处理视频的后台任务"""
        redis = None
        try:
            redis = await self.get_redis()
            task_info_str = await redis.get(f"video_task:{task_id}")
            if not task_info_str:
                return
                
            task_info = json.loads(task_info_str)
            video_path = task_info["video_path"]
            
            # 更新状态为处理中
            task_info["status"] = VideoTaskStatus.PROCESSING
            await redis.set(f"video_task:{task_id}", json.dumps(task_info))
            
            # 打开视频
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                raise Exception("无法打开视频文件")
            
            # 获取平台相关视频设置
            ext, fourcc_code, mime_type = self.get_platform_video_settings()
            
            # 获取视频信息
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            video_length = frame_count / fps if fps > 0 else 0
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            
            # 创建临时输出视频文件 - 使用检测到的编码器
            output_path = f"{tempfile.gettempdir()}/{task_id}_annotated{ext}"
            fourcc = cv2.VideoWriter_fourcc(*fourcc_code)
            out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
            
            # 初始化结果
            results = []
            processed_frames = 0
            
            start_time = time.time()
            
            # 每隔几帧处理一次（根据视频长度调整）
            frame_interval = max(1, int(fps / 30))  # 每秒处理30帧
            
            frame_idx = 0
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                    
                # 创建原始帧的副本用于写入输出视频
                output_frame = frame.copy()
                
                # 按照间隔处理帧
                if frame_idx % frame_interval == 0:
                    # 转换颜色空间
                    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    
                    # 执行检测
                    predictions = detector.predict(cv2.imencode('.jpg', frame_rgb)[1].tobytes())
                    
                    # 如果有检测结果，生成标注图像
                    annotated_frame = None
                    if predictions:
                        # 绘制标注
                        for pred in predictions:
                            bbox = pred["bbox"]
                            x1, y1, x2, y2 = int(bbox["x1"]), int(bbox["y1"]), int(bbox["x2"]), int(bbox["y2"])
                            cv2.rectangle(output_frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                            label = f"{pred['class']} {pred['confidence']:.2f}"
                            cv2.putText(output_frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
                            
                        # 编码为base64
                        _, buffer = cv2.imencode('.jpg', output_frame)
                        annotated_frame = "data:image/jpeg;base64," + base64.b64encode(buffer).decode('utf-8')
                    
                    # 添加到结果
                    results.append({
                        "timestamp": int(frame_idx / fps * 1000),  # 毫秒
                        "frame_index": frame_idx,
                        "detections": predictions,
                        "annotated_frame": annotated_frame
                    })
                    
                    processed_frames += 1
                
                # 所有帧都写入输出视频（无论是否处理过）
                out.write(output_frame)
                
                # 更新进度
                progress = int((frame_idx / frame_count) * 100) if frame_count > 0 else 0
                task_info["progress"] = progress
                await redis.set(f"video_task:{task_id}", json.dumps(task_info))
                
                frame_idx += 1
            
            # 释放资源
            cap.release()
            out.release()
            
            # 处理完成，保存结果
            end_time = time.time()
            processing_time = end_time - start_time
            
            # 确保静态目录存在
            static_dir = os.path.join("app", "static", "videos")
            os.makedirs(static_dir, exist_ok=True)
            
            # 创建静态文件URL
            annotated_video_url = f"/api/static/videos/{task_id}_annotated{ext}" 
            
            # 将处理后的视频移动到静态文件目录
            final_path = os.path.join(static_dir, f"{task_id}_annotated{ext}")
            
            # 在_process_video方法中替换os.rename
            try:
                shutil.move(output_path, final_path)
            except Exception as e:
                # 如果移动失败，可能是权限问题，尝试复制然后删除
                print(f"移动文件失败，尝试复制: {str(e)}")
                shutil.copy(output_path, final_path)
                os.remove(output_path)
            
            result = {
                "status": "success",
                "video_length": video_length,
                "processed_frames": processed_frames,
                "time_cost": processing_time,
                "fps": processed_frames / processing_time if processing_time > 0 else 0,
                "results": results,
                "annotated_video_url": annotated_video_url
            }
            
            # 修改任务状态更新和结果保存部分，增加错误处理
            try:
                # 更新任务状态为完成
                task_info["status"] = VideoTaskStatus.COMPLETED
                task_info["progress"] = 100
                task_info["completed_at"] = time.time()
                task_info["annotated_video_path"] = final_path
                
                if redis is None:
                    redis = await self.get_redis()
                
                # 使用JSON序列化而不是repr
                await redis.set(f"video_task:{task_id}", json.dumps(task_info))
                
                # 保存结果（7天过期），尝试JSON序列化
                await redis.set(f"video_result:{task_id}", json.dumps(result), ex=60*60*24*7)
                
                # 首先将完整结果保存到文件（这部分你已经实现了）
                result_file = os.path.join(static_dir, f"{task_id}_result.json")
                with open(result_file, 'w') as f:
                    json.dump(result, f)
                
                # 仅在Redis中存储轻量级元数据
                meta_result = {
                    "status": result["status"],
                    "task_id": task_id,
                    "video_length": result.get("video_length", 0),
                    "processed_frames": result.get("processed_frames", 0),
                    "time_cost": result.get("time_cost", 0),
                    "fps": result.get("fps", 0),
                    "result_file_path": result_file,
                    "annotated_video_url": f"/api/static/videos/{task_id}_annotated.mp4"
                }
                
                # 这个元数据很小，不会超过Redis限制
                await redis.set(f"video_task:{task_id}", json.dumps(meta_result))
                
            except Exception as redis_err:
                print(f"保存结果到Redis失败: {str(redis_err)}")
                # 保存到文件作为备份
                result_file = os.path.join(static_dir, f"{task_id}_result.json")
                with open(result_file, 'w') as f:
                    json.dump(result, f)
                    
        except Exception as e:
            # 处理失败
            print(f"视频处理失败: {str(e)}")
            try:
                task_info["status"] = VideoTaskStatus.FAILED
                task_info["error"] = str(e)
                task_info["message"] = "视频处理失败，可能是编码器不兼容或Redis连接问题"
                if redis is not None:
                    await redis.set(f"video_task:{task_id}", json.dumps(task_info))
            except Exception as inner_error:
                print(f"更新失败状态出错: {str(inner_error)}")
            
        finally:
            # 删除临时文件
            try:
                if os.path.exists(video_path):
                    os.unlink(video_path)
            except:
                pass

# 全局单例实例
video_processor = VideoProcessor()