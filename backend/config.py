import os
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    model_path: str = "model_weights/prod_model.pth"
    cors_origins: str = "http://localhost:3000"
    max_file_size: int = 10_000_000  # 10MB
    debug: bool = False

    class Config:
        # 动态加载 docker-compose 注入的环境变量，无需指定固定文件
        env_file = os.getenv("ENV_FILE", ".env")   # 默认读取 .env，可通过 ENV_FILE 覆盖

@lru_cache()
def get_settings():
    return Settings()