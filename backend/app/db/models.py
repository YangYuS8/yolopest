from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Detection(Base):
    __tablename__ = "detections"
    
    id = Column(Integer, primary_key=True)
    image_path = Column(String)
    annotated_path = Column(String)
    results = Column(JSON)
    created_at = Column(DateTime)