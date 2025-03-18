from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import time
from datetime import datetime  # 正确导入datetime

from app.models.base import Base

class History(Base):
    """历史记录模型"""
    __tablename__ = "history"

    id = Column(String, primary_key=True)  # 使用UUID作为主键
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    user = relationship("User", back_populates="history")
    timestamp = Column(DateTime, default=func.now(), index=True)
    type = Column(String, index=True)  # 'image', 'video' 或其他类型
    filename = Column(String)
    thumbnail = Column(Text, nullable=True)  # 缩略图存储为 base64 字符串
    result = Column(JSONB, nullable=True)  # 确保允许为空

    def to_dict(self):
        ts = None
        if self.timestamp:
            try:
                # 转换时间戳
                ts = time.mktime(self.timestamp.timetuple()) * 1000 + self.timestamp.microsecond / 1000
            except:
                ts = None
        
        return {
            "id": self.id,
            "timestamp": ts,  # 转为JS时间戳（毫秒）
            "type": self.type,
            "filename": self.filename,
            "thumbnail": self.thumbnail,
            "result": self.result or {}
        }