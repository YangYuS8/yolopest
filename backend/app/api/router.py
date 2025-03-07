from fastapi import APIRouter
from app.api.endpoints import detection, video  # 导入新创建的视频端点

api_router = APIRouter(prefix="/api")

# 包含各个端点路由
api_router.include_router(detection.router, prefix="/detection", tags=["detection"])
api_router.include_router(video.router, prefix="/video", tags=["video"])