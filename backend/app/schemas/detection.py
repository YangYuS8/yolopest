from pydantic import BaseModel
from typing import List, Optional, Dict, Any

# 如果 PredictionResult 未定义，需要先定义它
class PredictionResult(BaseModel):
    class_: str = "class"
    confidence: float
    bbox: Dict[str, int]

    class Config:
        fields = {"class_": "class"}

class BatchDetectionResult(BaseModel):
    filename: str
    predictions: Optional[List[PredictionResult]] = []
    annotated_image: Optional[str] = None
    error: Optional[str] = None
    success: Optional[bool] = True

class BatchDetectionResponse(BaseModel):
    status: str
    message: str
    time_cost: float
    processed_count: int
    success_count: int
    results: List[BatchDetectionResult]