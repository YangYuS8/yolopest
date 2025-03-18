from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base  # 导入共享的Base

class Detection(Base):
    __tablename__ = "detections"
    
    id = Column(Integer, primary_key=True, index=True)
    image_path = Column(String)
    annotated_path = Column(String, nullable=True)
    results = Column(JSONB, nullable=True)  # 使用JSONB代替JSON
    created_at = Column(DateTime, default=func.now())
    
    # 添加用户关联
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    user = relationship("User", back_populates="detections")