from fastapi import APIRouter
from app.api import detection
from app.api.api import api_router as user_api_router
from app.api import ai_analysis, history  # 添加history导入

router = APIRouter()

# 包括现有的API
router.include_router(detection.router, prefix="/detection", tags=["Detection"])
router.include_router(ai_analysis.router, prefix="/ai-analysis", tags=["AI-Analysis"])
router.include_router(history.router, prefix="/history", tags=["History"])

# 包括用户API
router.include_router(user_api_router, prefix="")