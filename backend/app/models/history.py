from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.detection import Base
import time
from datetime import datetime
from pydantic import validator

class History(Base):
    """历史记录模型"""
    __tablename__ = "history_records"

    id = Column(String, primary_key=True, index=True)  # UUID 作为主键
    user_id = Column(String, nullable=True, index=True)  # 为未来的用户系统预留
    timestamp = Column(DateTime, default=func.now(), index=True)
    type = Column(String, index=True)  # 'image', 'video' 或其他类型
    filename = Column(String)
    thumbnail = Column(Text, nullable=True)  # 缩略图存储为 base64 字符串
    result = Column(JSON, nullable=True)  # 确保允许为空

    @validator('timestamp', pre=True)
    def ensure_naive_datetime(cls, v):
        if v is None:
            return datetime.now()
        if isinstance(v, datetime):
            if v.tzinfo:
                # 转换时区并移除时区信息
                return v.astimezone().replace(tzinfo=None)
            return v
        if isinstance(v, (int, float)):
            # 前端传来的毫秒时间戳转为datetime对象
            return datetime.fromtimestamp(v / 1000.0).replace(tzinfo=None)

    def to_dict(self):
        ts = None
        if self.timestamp:
            try:
                # 使用 time.mktime 将本地时间转换为时间戳，确保无时区信息
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