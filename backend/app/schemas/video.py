from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class Prediction(BaseModel):
    class_name: str = "class"
    confidence: float
    bbox: Dict[str, int]

class DetectionResult(BaseModel):
    timestamp: float
    predictions: List[Prediction]

class VideoInfo(BaseModel):
    duration: float
    fps: float
    total_frames: int

class VideoResponse(BaseModel):
    total_frames: int
    processed_frames: int
    fps: float
    duration: float
    detection_results: List[Dict[str, Any]]
    annotated_video: str

class AsyncVideoResponse(BaseModel):
    task_id: str