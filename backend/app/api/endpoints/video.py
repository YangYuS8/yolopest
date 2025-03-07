from fastapi import APIRouter, UploadFile, File, BackgroundTasks, Depends, WebSocket, Query
from typing import Dict, Any, Optional

from app.core.deps import VideoSvc, DbSession, AppSettings, ProgressTracker
from app.schemas.video import VideoResponse, AsyncVideoResponse  # 需要创建这些模式

router = APIRouter()

@router.post("/process", response_model=VideoResponse)
async def process_video(
    video_service: VideoSvc,
    settings: AppSettings,
    video_file: UploadFile = File(...),
    frame_skip: int = Query(3, description="每隔多少帧处理一次"),
):
    """处理视频并返回检测结果"""
    video_bytes = await video_file.read()
    
    result = video_service.process_video(
        video_bytes=video_bytes,
        temp_dir=settings.temp_dir,
        frame_skip=frame_skip,
        conf_thresh=settings.conf_thresh
    )
    
    return result

@router.post("/process-async", response_model=AsyncVideoResponse)
async def process_video_async(
    video_service: VideoSvc,
    settings: AppSettings,
    video_file: UploadFile = File(...),
    client_id: Optional[str] = Query(None, description="客户端ID，用于唯一标识任务"),
    frame_skip: int = Query(3, description="每隔多少帧处理一次"),
):
    """异步处理视频，返回任务ID"""
    video_bytes = await video_file.read()
    
    task_id = video_service.process_video_async(
        video_bytes=video_bytes,
        client_id=client_id,
        temp_dir=settings.temp_dir,
        frame_skip=frame_skip,
        conf_thresh=settings.conf_thresh
    )
    
    return {"task_id": task_id}

@router.get("/task/{task_id}")
async def get_task_progress(
    task_id: str,
    progress_tracker: ProgressTracker
):
    """获取任务进度"""
    # 获取基本进度信息
    progress_info = progress_tracker.get(task_id, {"status": "unknown", "progress": 0})
    
    # 检查是否有完整的结果
    if f"{task_id}_result" in progress_tracker:
        return {
            **progress_info,
            "result": progress_tracker[f"{task_id}_result"]
        }
    
    # 检查是否有错误
    if f"{task_id}_error" in progress_tracker:
        return {
            "status": "error",
            "progress": -1,
            "error": progress_tracker[f"{task_id}_error"]
        }
    
    # 检查是否有中间数据
    if f"{task_id}_data" in progress_tracker:
        return progress_tracker[f"{task_id}_data"]
    
    return progress_info