from typing import AsyncGenerator, Annotated, Dict, Any
from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import AsyncSessionLocal
from app.core.config import get_settings, Settings
from app.services.detection import DetectionService
from app.services.video import VideoService
from app.db.repositories.detection import DetectionRepository

# 全局状态字典（更好的方式是使用Redis）
progress_tracker: Dict[str, Any] = {}

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """获取数据库会话依赖，自动管理会话生命周期"""
    async with AsyncSessionLocal() as session:
        yield session
        
# 创建依赖注入链
DbSession = Annotated[AsyncSession, Depends(get_db)]
AppSettings = Annotated[Settings, Depends(get_settings)]

# 共享状态依赖
def get_progress_tracker() -> Dict[str, Any]:
    """获取进度跟踪器实例"""
    return progress_tracker

ProgressTracker = Annotated[Dict[str, Any], Depends(get_progress_tracker)]

# 仓储依赖
def get_detection_repository(db: DbSession) -> DetectionRepository:
    """获取检测结果仓储实例"""
    return DetectionRepository(db)

DetectionRepo = Annotated[DetectionRepository, Depends(get_detection_repository)]

# 服务依赖
def get_detection_service(repo: DetectionRepo, settings: AppSettings) -> DetectionService:
    """获取检测服务实例"""
    return DetectionService(repo, settings)

DetectionSvc = Annotated[DetectionService, Depends(get_detection_service)]

# 视频服务依赖
def get_video_service(detection_svc: DetectionSvc, settings: AppSettings, 
                      progress_tracker: ProgressTracker) -> VideoService:
    """获取视频处理服务实例"""
    return VideoService(detection_svc, settings, progress_tracker)

VideoSvc = Annotated[VideoService, Depends(get_video_service)]