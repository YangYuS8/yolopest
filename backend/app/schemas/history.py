from pydantic import BaseModel, validator, Field
from typing import Dict, Any, Optional
from datetime import datetime, timezone

class HistoryCreate(BaseModel):
    id: Optional[str] = None
    timestamp: Optional[datetime] = None
    type: str
    filename: str
    thumbnail: Optional[str] = None
    result: Optional[Dict[str, Any]] = {}
    
    # 添加验证器确保时间戳没有时区信息
    @validator('timestamp', pre=True)
    def ensure_naive_datetime(cls, v):
        if v is None:
            return datetime.now()
        if isinstance(v, datetime):
            if v.tzinfo:
                # 转换时区并移除时区信息
                return v.astimezone().replace(tzinfo=None)
            return v
        if isinstance(v, str):
            try:
                dt = datetime.fromisoformat(v)
                if dt.tzinfo:
                    return dt.astimezone().replace(tzinfo=None)
                return dt
            except ValueError:
                # 尝试其他格式
                try:
                    return datetime.strptime(v, "%Y-%m-%dT%H:%M:%S.%fZ").replace(tzinfo=None)
                except ValueError:
                    pass
        # 将时间戳转换为datetime
        try:
            if isinstance(v, (int, float)):
                dt = datetime.fromtimestamp(v / 1000.0)  # 假设前端传的是毫秒级时间戳
                return dt.replace(tzinfo=None)
        except:
            pass
            
        raise ValueError("无法解析日期时间格式")

class HistoryResponse(BaseModel):
    id: str
    timestamp: float  # JavaScript 时间戳（毫秒）
    type: str
    filename: str
    thumbnail: Optional[str] = None
    result: Dict[str, Any] = {}