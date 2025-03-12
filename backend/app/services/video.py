import cv2
import numpy as np
import tempfile
import os
from typing import List, Dict, Any, Optional
import asyncio
from app.core.config import get_settings
from app.services.detector import detector
import base64
import time
import uuid
from redis.asyncio import Redis

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
    
    async def create_task(self, video_bytes: bytes) -> str:
        """创建视频处理任务，返回任务ID"""
        task_id = str(uuid.uuid4())
        redis = await self.get_redis()
        
        # 保存视频到临时文件
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as tmp:
            tmp.write(video_bytes)
            video_path = tmp.name
        
        # 创建任务信息
        task_info = {
            "id": task_id,
            "status": VideoTaskStatus.PENDING,
            "video_path": video_path,
            "created_at": time.time(),
            "progress": 0
        }
        
        # 保存到Redis
        await redis.set(f"video_task:{task_id}", repr(task_info))
        # 将任务添加到队列
        await redis.lpush("video_tasks_queue", task_id)
        
        # 启动后台任务处理
        asyncio.create_task(self._process_video(task_id))
        
        return task_id
    
    async def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """获取任务状态"""
        redis = await self.get_redis()
        task_info_str = await redis.get(f"video_task:{task_id}")
        
        if not task_info_str:
            return {"status": "not_found"}
            
        try:
            task_info = eval(task_info_str)
            # 移除不需要返回的字段
            if "video_path" in task_info:
                del task_info["video_path"]
            return task_info
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    async def get_task_result(self, task_id: str) -> Dict[str, Any]:
        """获取任务结果"""
        redis = await self.get_redis()
        task_info_str = await redis.get(f"video_task:{task_id}")
        result_str = await redis.get(f"video_result:{task_id}")
        
        if not task_info_str:
            return {"status": "not_found"}
            
        if not result_str:
            task_info = eval(task_info_str)
            return {"status": task_info.get("status", "unknown"), "progress": task_info.get("progress", 0)}
            
        try:
            result = eval(result_str)
            return result
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    async def _process_video(self, task_id: str):
        """处理视频的后台任务"""
        redis = await self.get_redis()
        task_info_str = await redis.get(f"video_task:{task_id}")
        if not task_info_str:
            return
            
        task_info = eval(task_info_str)
        video_path = task_info["video_path"]
        
        # 更新状态为处理中
        task_info["status"] = VideoTaskStatus.PROCESSING
        await redis.set(f"video_task:{task_id}", repr(task_info))
        
        try:
            # 打开视频
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                raise Exception("无法打开视频文件")
            
            # 获取视频信息
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            video_length = frame_count / fps if fps > 0 else 0
            
            # 初始化结果
            results = []
            processed_frames = 0
            start_time = time.time()
            
            # 每隔几帧处理一次（根据视频长度调整）
            frame_interval = max(1, int(fps / 2))  # 每秒处理2帧
            
            frame_idx = 0
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                    
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
                            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                            label = f"{pred['class']} {pred['confidence']:.2f}"
                            cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
                            
                        # 编码为base64
                        _, buffer = cv2.imencode('.jpg', frame)
                        annotated_frame = "data:image/jpeg;base64," + base64.b64encode(buffer).decode('utf-8')
                    
                    # 添加到结果
                    results.append({
                        "timestamp": int(frame_idx / fps * 1000),  # 毫秒
                        "frame_index": frame_idx,
                        "detections": predictions,
                        "annotated_frame": annotated_frame
                    })
                    
                    processed_frames += 1
                
                # 更新进度
                progress = int((frame_idx / frame_count) * 100) if frame_count > 0 else 0
                task_info["progress"] = progress
                await redis.set(f"video_task:{task_id}", repr(task_info))
                
                frame_idx += 1
            
            # 释放资源
            cap.release()
            
            # 处理完成，保存结果
            end_time = time.time()
            processing_time = end_time - start_time
            
            result = {
                "status": "success",
                "video_length": video_length,
                "processed_frames": processed_frames,
                "time_cost": processing_time,
                "fps": processed_frames / processing_time if processing_time > 0 else 0,
                "results": results
            }
            
            # 更新任务状态为完成
            task_info["status"] = VideoTaskStatus.COMPLETED
            task_info["progress"] = 100
            task_info["completed_at"] = time.time()
            
            await redis.set(f"video_task:{task_id}", repr(task_info))
            # 保存结果（7天过期）
            await redis.set(f"video_result:{task_id}", repr(result), ex=60*60*24*7)
            
        except Exception as e:
            # 处理失败
            task_info["status"] = VideoTaskStatus.FAILED
            task_info["error"] = str(e)
            await redis.set(f"video_task:{task_id}", repr(task_info))
            
        finally:
            # 删除临时文件
            try:
                if os.path.exists(video_path):
                    os.unlink(video_path)
            except:
                pass

# 全局单例实例
video_processor = VideoProcessor()