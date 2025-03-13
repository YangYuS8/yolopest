from pydantic_settings import BaseSettings  # 修改为从pydantic_settings导入
import os
from functools import lru_cache

class Settings(BaseSettings):
    model_path: str
    img_size: int
    conf_thresh: float
    debug: bool
    postgres_user: str
    postgres_password: str
    postgres_db: str
    database_url: str
    redis_url: str = "redis://localhost:6379/0"
    
    # 确保静态目录设置正确
    static_dir: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "app", "static")

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()