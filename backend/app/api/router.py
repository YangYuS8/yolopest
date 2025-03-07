from fastapi import APIRouter
from app.api.endpoints import detection, video, websocket  # 添加websocket导入

api_router = APIRouter(prefix="/api")

# 包含各个端点路由
api_router.include_router(detection.router, prefix="/detection", tags=["detection"])
api_router.include_router(video.router, prefix="/video", tags=["video"])
api_router.include_router(websocket.router, prefix="/ws", tags=["websocket"])  # 添加WebSocket路由