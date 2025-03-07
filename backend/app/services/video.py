import os
import cv2
import base64
import time
import uuid
import tempfile
import numpy as np
import concurrent.futures
from typing import List, Dict, Any, Optional
from datetime import datetime
from pathlib import Path
import threading

from app.core.config import Settings
from app.services.detection import DetectionService
from app.utils.websocket import update_progress
from app.utils.video import get_video_codec

class VideoService:
    """视频处理服务，处理视频检测和分析"""
    
    def __init__(self, 
                detection_service: DetectionService,
                settings: Settings,
                progress_tracker: Dict[str, Any]):
        """
        初始化视频服务
        
        Args:
            detection_service: 检测服务实例
            settings: 应用配置
            progress_tracker: 进度跟踪器字典
        """
        self.detection_service = detection_service
        self.settings = settings
        self.progress_tracker = progress_tracker
    
    def process_video(self, video_bytes: bytes, temp_dir: str = None, 
                     frame_skip: int = 3, conf_thresh: float = None) -> Dict[str, Any]:
        """处理视频文件并返回检测结果"""
        # 生成临时文件名和视频路径
        video_id = str(uuid.uuid4())
        if temp_dir is None:
            temp_dir = tempfile.gettempdir()
        
        input_path = Path(temp_dir) / f"{video_id}.mp4"
        with open(str(input_path), "wb") as f:
            f.write(video_bytes)
        
        # 打开视频
        video = cv2.VideoCapture(str(input_path))
        if not video.isOpened():
            raise ValueError("无法打开视频文件")
            
        # 获取视频属性
        width = int(video.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(video.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = video.get(cv2.CAP_PROP_FPS)
        total_frames = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # 获取适当的编解码器
        fourcc, output_extension = get_video_codec()
        output_path = str(Path(temp_dir) / f"{video_id}_annotated{output_extension}")
        
        # 创建视频写入对象
        writer = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        # 处理结果统计
        frame_count = 0
        detection_results = []
        
        # 逐帧处理
        while True:
            ret, frame = video.read()
            if not ret:
                break
                
            # 使用传入的frame_skip参数控制帧采样率
            if frame_count % frame_skip == 0:
                # 转换为RGB
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                
                # 执行检测
                predictions = self.detection_service.predict_frame(
                    rgb_frame, 
                    img_size=self.detection_service.img_size,
                    conf_thresh=conf_thresh
                )
                
                # 记录时间戳和检测结果
                if predictions:
                    detection_results.append({
                        "timestamp": frame_count / fps,
                        "predictions": predictions
                    })
                
                # 在帧上绘制检测结果
                frame = self.detection_service.annotate_frame(frame, predictions)
            
            # 写入帧
            writer.write(frame)
            frame_count += 1
            
        # 释放资源
        video.release()
        writer.release()
        
        # 读取处理后的视频并转换为base64
        with open(output_path, "rb") as f:
            processed_video = f.read()
            video_base64 = base64.b64encode(processed_video).decode("utf-8")
        
        # 清理临时文件
        try:
            os.remove(str(input_path))
            os.remove(str(output_path))
        except Exception as e:
            print(f"清理临时文件失败: {str(e)}")
        
        # 根据文件扩展名确定正确的MIME类型
        mime_type = "video/mp4"
        if output_extension == ".avi":
            mime_type = "video/x-msvideo"
        elif output_extension == ".webm":
            mime_type = "video/webm"
            
        return {
            "total_frames": total_frames,
            "processed_frames": frame_count,
            "fps": fps,
            "duration": frame_count / fps,
            "detection_results": detection_results,
            "annotated_video": f"data:{mime_type};base64,{video_base64}"
        }
    
    def process_video_async(self, video_bytes: bytes, client_id: str, 
                           temp_dir: str = None, frame_skip: int = 3, 
                           conf_thresh: float = None, 
                           max_chunk_frames: int = 500) -> str:
        """异步处理视频，返回任务ID，处理结果通过WebSocket推送"""
        # 生成唯一任务ID
        task_id = client_id or str(uuid.uuid4())
        start_time = time.time()
        
        # 定义后台处理函数
        def process_in_background():
            try:
                # 准备临时目录
                if temp_dir is None:
                    temp_dir_path = tempfile.gettempdir()
                else:
                    temp_dir_path = temp_dir
                    
                # 保存上传的视频到临时文件
                input_path = Path(temp_dir_path) / f"{task_id}.mp4"
                with open(str(input_path), "wb") as f:
                    f.write(video_bytes)
                
                # 打开视频
                video = cv2.VideoCapture(str(input_path))
                if not video.isOpened():
                    raise ValueError("无法打开视频文件")
                    
                # 获取视频属性
                width = int(video.get(cv2.CAP_PROP_FRAME_WIDTH))
                height = int(video.get(cv2.CAP_PROP_FRAME_HEIGHT))
                fps = video.get(cv2.CAP_PROP_FPS)
                total_frames = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
                
                # 初始化进度跟踪
                update_progress(task_id, 0, self.progress_tracker)
                
                # 获取适当的编解码器
                fourcc, output_extension = get_video_codec()
                output_path = str(Path(temp_dir_path) / f"{task_id}_annotated{output_extension}")
                
                # 创建视频写入对象
                writer = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
                
                # 处理结果统计
                frame_count = 0
                detection_results = []
                interim_results = []
                last_push_time = time.time()
                
                # 划分处理块
                chunk_size = max_chunk_frames
                
                # 多进程处理视频帧
                with concurrent.futures.ProcessPoolExecutor(max_workers=min(os.cpu_count(), 4)) as executor:
                    while True:
                        chunk_frames = []
                        chunk_indices = []
                        
                        # 收集一批帧
                        for _ in range(chunk_size):
                            ret, frame = video.read()
                            if not ret:
                                break
                            
                            if frame_count % frame_skip == 0:
                                chunk_frames.append(frame)
                                chunk_indices.append(frame_count)
                            frame_count += 1
                        
                        if not chunk_frames:
                            break  # 视频读取完毕
                        
                        # 计算当前进度
                        progress = min(int((frame_count / total_frames) * 100), 95)
                        update_progress(task_id, progress, self.progress_tracker)
                        
                        # 创建处理任务
                        futures = []
                        for frame in chunk_frames:
                            # 转RGB
                            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                            # 提交处理任务
                            future = executor.submit(
                                self.detection_service._process_single_frame,
                                rgb_frame,
                                self.detection_service.img_size,
                                conf_thresh or self.detection_service.conf_thresh
                            )
                            futures.append(future)
                        
                        # 收集结果并应用到帧
                        for i, future in enumerate(concurrent.futures.as_completed(futures)):
                            frame_idx = chunk_indices[i]
                            frame = chunk_frames[i]
                            predictions = future.result()
                            
                            # 只记录有检测结果的帧
                            if predictions:
                                result = {
                                    "timestamp": frame_idx / fps,
                                    "predictions": predictions
                                }
                                detection_results.append(result)
                                interim_results.append(result)
                            
                            # 在帧上绘制检测结果
                            frame = self.detection_service.annotate_frame(frame, predictions)
                            
                            # 写入帧
                            writer.write(frame)
                        
                        # 周期性推送中间结果（每5秒或进度变化显著）
                        current_time = time.time()
                        if current_time - last_push_time > 5 and interim_results:
                            # 更新进度包含中间检测结果
                            progress_data = {
                                "progress": progress,
                                "status": "processing",
                                "interim_results": interim_results
                            }
                            # 在真实实现中，这里会通过Redis或类似机制发送给WebSocket处理器
                            self.progress_tracker[f"{task_id}_data"] = progress_data
                            last_push_time = current_time
                            interim_results = []  # 清空中间结果
                
                # 释放资源
                video.release()
                writer.release()
                
                # 读取处理后的视频并转换为base64
                with open(output_path, "rb") as f:
                    processed_video = f.read()
                    video_base64 = base64.b64encode(processed_video).decode("utf-8")
                
                # 根据文件扩展名确定正确的MIME类型
                mime_type = "video/mp4"
                if output_extension == ".avi":
                    mime_type = "video/x-msvideo"
                elif output_extension == ".webm":
                    mime_type = "video/webm"
                
                # 最终结果
                final_result = {
                    "time_cost": round(time.time() - start_time, 3),
                    "results": detection_results,
                    "annotated_video": f"data:{mime_type};base64,{video_base64}",
                    "video_info": {
                        "duration": frame_count / fps if fps > 0 else 0,
                        "fps": fps,
                        "total_frames": total_frames
                    }
                }
                
                # 存储完整结果以便后续获取
                self.progress_tracker[f"{task_id}_result"] = final_result
                update_progress(task_id, 100, self.progress_tracker)
                
                # 清理临时文件
                try:
                    os.remove(str(input_path))
                    os.remove(str(output_path))
                except Exception as e:
                    print(f"清理临时文件失败: {str(e)}")
                
            except Exception as e:
                # 记录错误
                self.progress_tracker[f"{task_id}_error"] = str(e)
                update_progress(task_id, -1, self.progress_tracker)  # 错误状态
                print(f"视频处理错误: {str(e)}")
        
        # 启动后台线程处理
        thread = threading.Thread(target=process_in_background)
        thread.daemon = True
        thread.start()
        
        return task_id