from fastapi_users.db import SQLAlchemyBaseUserTable
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base  # 导入共享的Base

class User(SQLAlchemyBaseUserTable[int], Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    email = Column(String, nullable=False, unique=True, index=True)
    username = Column(String, nullable=False, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    role = Column(String, default="user")  # 可以是 'user' 或 'admin'
    
    # 检测结果关联
    detections = relationship("Detection", back_populates="user", cascade="all, delete")
    history = relationship("History", back_populates="user", cascade="all, delete")