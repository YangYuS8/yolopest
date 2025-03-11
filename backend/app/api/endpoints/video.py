from fastapi import APIRouter, UploadFile, File, BackgroundTasks, Depends, WebSocket, Query, HTTPException, Request
from typing import Dict, Any, Optional
import uuid
import traceback
import json
from datetime import datetime
from app.core.deps import VideoSvc, DbSession, AppSettings, ProgressTracker
from app.schemas.video import VideoResponse, AsyncVideoResponse  
from app.core.logging import app_logger as logger

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
    request: Request,
    video_service: VideoSvc,
    settings: AppSettings,
    video_file: UploadFile = File(...),
    client_id: Optional[str] = Query(None, description="客户端ID，用于唯一标识任务"),
    frame_skip: int = Query(3, description="每隔多少帧处理一次"),
):
    """异步处理视频，返回任务ID"""
    # 生成请求ID
    request_id = str(uuid.uuid4())
    logger.info(f"[{request_id}] 收到视频处理请求: {video_file.filename}, client_id: {client_id or '未提供'}")
    
    try:
        # 记录客户端信息
        client_host = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        logger.debug(f"[{request_id}] 客户端信息: {client_host}, User-Agent: {user_agent}")
        
        # 读取视频数据
        logger.debug(f"[{request_id}] 开始读取视频文件")
        video_bytes = await video_file.read()
        video_size = len(video_bytes)
        logger.debug(f"[{request_id}] 视频文件读取完成: {video_size} 字节")
        
        # 检查视频大小
        if video_size > 100 * 1024 * 1024:  # 100MB
            logger.warning(f"[{request_id}] 视频文件过大: {video_size} 字节")
            raise HTTPException(
                status_code=400,
                detail={
                    "code": "FILE_TOO_LARGE",
                    "message": "视频文件过大，请上传小于100MB的文件",
                    "status": "error"
                }
            )
        
        # 检查文件类型
        filename = video_file.filename.lower()
        logger.debug(f"[{request_id}] 检查视频文件类型: {filename}")
        
        if not any(filename.endswith(ext) for ext in ['.mp4', '.avi', '.mov', '.mkv']):
            logger.warning(f"[{request_id}] 不支持的视频格式: {filename}")
            raise HTTPException(
                status_code=400,
                detail={
                    "code": "INVALID_FILE_TYPE",
                    "message": "不支持的视频格式，请上传MP4、AVI、MOV或MKV格式",
                    "status": "error"
                }
            )
            
        # 开始异步处理
        logger.debug(f"[{request_id}] 开始异步处理视频: frame_skip={frame_skip}")
        task_id = video_service.process_video_async(
            video_bytes=video_bytes,
            client_id=client_id or request_id,  # 如果未提供client_id，使用request_id
            temp_dir=settings.temp_dir,
            frame_skip=frame_skip,
            conf_thresh=settings.conf_thresh
        )
        logger.info(f"[{request_id}] 视频处理任务已创建: task_id={task_id}")
        
        return {
            "status": "processing",
            "task_id": task_id,
            "message": "视频处理已开始，请通过WebSocket或轮询获取结果"
        }
    except HTTPException:
        raise
    except Exception as e:
        # 详细错误日志
        error_detail = traceback.format_exc()
        error_id = str(uuid.uuid4())
        
        # 结构化错误日志
        error_log = {
            "error_id": error_id,
            "request_id": request_id,
            "timestamp": datetime.now().isoformat(),
            "file_name": video_file.filename,
            "file_size": len(video_bytes) if 'video_bytes' in locals() else "未知",
            "exception_type": type(e).__name__,
            "exception_msg": str(e),
            "stacktrace": error_detail
        }
        
        # 打印格式化的错误日志
        logger.error(f"[{request_id}] 视频处理错误 (error_id: {error_id}):\n{json.dumps(error_log, indent=2, ensure_ascii=False)}")
        
        raise HTTPException(
            status_code=500,
            detail={
                "code": "VIDEO_PROCESSING_ERROR",
                "message": f"视频处理错误 (ID: {error_id})",
                "status": "error",
                "error_id": error_id
            }
        )

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