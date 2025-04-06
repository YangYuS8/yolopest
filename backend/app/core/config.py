from pydantic_settings import BaseSettings
from pydantic import Field
from functools import lru_cache
import os
from typing import Optional

class Settings(BaseSettings):
    # 现有配置
    debug: bool = os.getenv("DEBUG", "False").lower() == "true"
    model_path: str = os.getenv("MODEL_PATH", "./model_weights/best.pt") 
    img_size: int = int(os.getenv("IMG_SIZE", "640"))
    conf_thresh: float = float(os.getenv("CONF_THRESH", "0.5"))
    
    # 数据库配置 - 使用明确的默认值
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "yolopest")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "yolopest")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "yolopest")
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@localhost:5432/{POSTGRES_DB}"
    )
    
    # 为了向后兼容，保留小写版本
    @property
    def database_url(self) -> str:
        return self.DATABASE_URL
    
    # FastAPI Users配置
    secret_key: str = os.getenv("SECRET_KEY", "YOUR_SECRET_KEY_CHANGE_THIS_IN_PRODUCTION")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    class Config:
        # 根据.env中的ENV变量选择配置文件
        env = os.getenv("ENV", "development")
        env_file = f".env.{env}"
        case_sensitive = True  # 区分大小写的变量名
        extra = "allow"  # 添加此行，允许额外字段

# 单例模式，确保只创建一次配置
_settings = None

@lru_cache()
def get_settings() -> Settings:
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings