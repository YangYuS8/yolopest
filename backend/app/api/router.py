from fastapi import APIRouter
from app.api import detection  # 修正导入路径
from app.api.api import api_router as user_api_router  # 导入用户API路由
from app.api import ai_analysis  # 添加这一行，导入AI分析路由

router = APIRouter()

# 包括现有的API
router.include_router(detection.router, prefix="/detection", tags=["Detection"])
# 如果有视频和批处理路由，请确保它们存在
# router.include_router(video.router, prefix="/video", tags=["Video"])
# router.include_router(batch.router, prefix="/batch", tags=["Batch"])

# 包括AI分析路由
router.include_router(ai_analysis.router, prefix="/ai-analysis", tags=["AI-Analysis"])

# 包括新的用户API
router.include_router(user_api_router, prefix="")