from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Detection(Base):
    __tablename__ = "detections"
    
    id = Column(Integer, primary_key=True)
    image_path = Column(String)      # 原图存储路径
    annotated_path = Column(String)  # 标注图路径
    results = Column(JSON)          # 检测结果
    created_at = Column(DateTime)   # 创建时间