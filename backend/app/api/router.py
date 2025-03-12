from fastapi import APIRouter
from app.api import detection, video

router = APIRouter()
router.include_router(detection.router, prefix="/detection", tags=["detection"])
router.include_router(video.router, prefix="/video", tags=["video"])