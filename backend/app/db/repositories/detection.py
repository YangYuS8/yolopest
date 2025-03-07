from typing import Dict, List, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Detection
from app.db.repositories.base import BaseRepository

class DetectionRepository(BaseRepository[Detection]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Detection)
    
    async def create_detection(
        self, 
        image_path: str, 
        annotated_path: str,
        results: List[Dict[str, Any]], 
        created_at: Any
    ) -> Detection:
        detection_data = {
            "image_path": image_path,
            "annotated_path": annotated_path,
            "results": results,
            "created_at": created_at
        }
        return await self.create(detection_data)