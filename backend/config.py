import os
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    model_path: str = "./model_weights/best.pt"
    cors_origins: str = "http://localhost:3000"
    max_file_size: int = 10_000_000  # 10MB
    img_size: int = 640          # 添加 img_size 字段，类型为 int，默认值 640
    conf_thresh: float = 0.25    # 添加 conf_thresh 字段，类型为 float，默认值 0.25
    debug: bool = False

    class Config:
        # 动态加载 docker-compose 注入的环境变量，无需指定固定文件
        # env_file = os.getenv("ENV_FILE", ".env")   # 默认读取 .env，可通过 ENV_FILE 覆盖
        env_file = ".env.development"  # 默认读取 .env.development

@lru_cache()
def get_settings():
    return Settings()