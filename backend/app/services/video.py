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
        # 确保任务存储目录存在
        self.tasks_dir = os.path.join("app", "static", "tasks")
        self.videos_dir = os.path.join("app", "static", "videos")
        os.makedirs(self.tasks_dir, exist_ok=True)
        os.makedirs(self.videos_dir, exist_ok=True)
    
    def _get_task_path(self, task_id: str) -> str:
        """获取任务状态文件路径"""
        return os.path.join(self.tasks_dir, f"{task_id}.json")
    
    def _get_result_path(self, task_id: str) -> str:
        """获取任务结果文件路径"""
        return os.path.join(self.videos_dir, f"{task_id}_result.json")
    
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
                if os.path.exists(video_path):
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
            
            # 保存到文件系统
            with open(self._get_task_path(task_id), 'w') as f:
                json.dump(task_info, f)
            
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
            # 首先检查结果文件
            result_file = self._get_result_path(task_id)
            if os.path.exists(result_file):
                # 从结果文件读取基本信息
                with open(result_file, 'r') as f:
                    result = json.load(f)
                    return {
                        "status": "completed",
                        "progress": 100,
                        "message": "处理完成",
                        "task_id": task_id,
                        **{k: v for k, v in result.items() if k in ['video_length', 'processed_frames', 'time_cost', 'fps']}
                    }
            
            # 然后检查任务状态文件
            task_file = self._get_task_path(task_id)
            if os.path.exists(task_file):
                with open(task_file, 'r') as f:
                    return json.load(f)
            
            # 都没有找到，返回未知状态
            return {"status": "unknown", "message": "任务状态未知"}
            
        except Exception as e:
            print(f"获取任务状态时出错: {str(e)}")
            return {"status": "error", "message": f"获取任务状态时出错: {str(e)}"}
    
    async def get_task_result(self, task_id: str) -> Dict[str, Any]:
        """获取任务结果"""
        try:
            # 从文件系统获取结果
            result_file = self._get_result_path(task_id)
            if os.path.exists(result_file):
                with open(result_file, 'r') as f:
                    result = json.load(f)
                    # 确保包含task_id和视频URL
                    result["task_id"] = task_id
                    result["annotated_video_url"] = f"/api/static/videos/{task_id}_annotated.mp4"
                    return result
                        
            # 结果文件不存在，检查任务状态
            task_file = self._get_task_path(task_id)
            if os.path.exists(task_file):
                with open(task_file, 'r') as f:
                    task_info = json.load(f)
                    if task_info["status"] == VideoTaskStatus.FAILED:
                        return {"status": "error", "message": task_info.get("message", "处理失败")}
                    elif task_info["status"] == VideoTaskStatus.PROCESSING:
                        return {"status": "processing", "progress": task_info.get("progress", 0)}
                    else:
                        return {"status": "pending", "message": "任务等待处理"}
            
            # 都没找到，返回错误状态
            return {"status": "error", "message": "任务结果不存在"}
        except Exception as e:
            print(f"获取任务结果失败: {str(e)}")
            return {"status": "error", "message": f"获取结果时出错: {str(e)}"}
    
    async def _process_video(self, task_id: str):
        """处理视频的后台任务"""
        task_file = self._get_task_path(task_id)
        video_path = ""
        
        try:
            # 读取任务信息
            with open(task_file, 'r') as f:
                task_info = json.load(f)
                video_path = task_info["video_path"]
            
            # 更新状态为处理中
            task_info["status"] = VideoTaskStatus.PROCESSING
            with open(task_file, 'w') as f:
                json.dump(task_info, f)
            
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
                    })
                    
                    processed_frames += 1
                
                # 所有帧都写入输出视频（无论是否处理过）
                out.write(output_frame)
                
                # 更新进度
                progress = int((frame_idx / frame_count) * 100) if frame_count > 0 else 0
                task_info["progress"] = progress
                
                # 定期更新进度文件 (每5%更新一次)
                if frame_idx == 0 or progress % 5 == 0 or frame_idx == frame_count - 1:
                    with open(task_file, 'w') as f:
                        json.dump(task_info, f)
                
                frame_idx += 1
            
            # 释放资源
            cap.release()
            out.release()
            
            # 处理完成，保存结果
            end_time = time.time()
            processing_time = end_time - start_time
            
            # 创建静态文件URL
            annotated_video_url = f"/api/static/videos/{task_id}_annotated{ext}" 
            
            # 将处理后的视频移动到静态文件目录
            final_path = os.path.join(self.videos_dir, f"{task_id}_annotated{ext}")
            
            # 复制文件到静态目录
            try:
                # 验证临时视频是否真的生成了
                if not os.path.exists(output_path):
                    print(f"错误：临时视频文件未生成: {output_path}")
                else:
                    file_size = os.path.getsize(output_path)
                    print(f"临时视频文件生成成功: {output_path}, 大小: {file_size} 字节")

                # 验证静态目录是否可写
                if not os.access(os.path.dirname(final_path), os.W_OK):
                    print(f"错误：静态目录无写入权限: {os.path.dirname(final_path)}")
                    
                # 复制文件到静态目录
                shutil.copy(output_path, final_path)
                os.remove(output_path)  # 删除临时文件
                
                # 验证最终文件是否成功生成
                if os.path.exists(final_path):
                    file_size = os.path.getsize(final_path)
                    print(f"标注视频文件成功保存: {final_path}, 大小: {file_size} 字节")
                else:
                    print(f"错误：标注视频文件未能成功保存: {final_path}")
                    
            except Exception as e:
                print(f"复制视频文件失败: {str(e)}")
                # 如果复制失败，尝试直接移动
                try:
                    shutil.move(output_path, final_path)
                    print(f"通过移动成功保存视频: {final_path}")
                except Exception as move_err:
                    print(f"移动视频文件也失败: {str(move_err)}")
            
            # 创建完整结果
            result = {
                "status": "success",
                "video_length": video_length,
                "processed_frames": processed_frames,
                "time_cost": processing_time,
                "fps": processed_frames / processing_time if processing_time > 0 else 0,
                "results": results,
                "annotated_video_url": annotated_video_url,
                "task_id": task_id
            }
            
            # 将结果保存到文件
            with open(self._get_result_path(task_id), 'w') as f:
                json.dump(result, f)
            
            # 更新任务状态为完成
            task_info["status"] = VideoTaskStatus.COMPLETED
            task_info["progress"] = 100
            task_info["completed_at"] = time.time()
            with open(task_file, 'w') as f:
                json.dump(task_info, f)
                    
        except Exception as e:
            # 处理失败
            print(f"视频处理失败: {str(e)}")
            try:
                # 读取当前任务信息
                with open(task_file, 'r') as f:
                    task_info = json.load(f)
                
                # 更新失败状态
                task_info["status"] = VideoTaskStatus.FAILED
                task_info["error"] = str(e)
                task_info["message"] = "视频处理失败，可能是编码器不兼容或文件格式问题"
                
                # 保存更新后的状态
                with open(task_file, 'w') as f:
                    json.dump(task_info, f)
            except Exception as inner_error:
                print(f"更新失败状态出错: {str(inner_error)}")
            
        finally:
            # 删除临时文件
            try:
                if video_path and os.path.exists(video_path):
                    os.unlink(video_path)
            except Exception as e:
                print(f"删除临时文件失败: {str(e)}")

# 全局单例实例
video_processor = VideoProcessor()