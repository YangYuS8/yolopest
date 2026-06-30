from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any

from app.services.ai_analysis import ai_analysis_service, AnalysisRequest
from app.models.user import User
from app.core.users import current_active_user

router = APIRouter()

@router.post("/", response_model=Dict[str, Any])
<<<<<<< HEAD
async def analyze_statistics(
    request: AnalysisRequest,
    current_user: User = Depends(current_active_user)
):
=======
async def analyze_statistics(request: AnalysisRequest):
>>>>>>> origin_main
    """根据统计数据生成AI分析报告"""
    try:
        result = await ai_analysis_service.generate_analysis(request)  # 添加await关键字
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))