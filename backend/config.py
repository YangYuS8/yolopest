import os
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    model_path: str
    # max_file_size: int = 10_000_000  # 10MB
    img_size: int          # 添加 img_size 字段，类型为 int，默认值 640
    conf_thresh: float    # 添加 conf_thresh 字段，类型为 float，默认值 0.25
    debug: bool
    postgres_user: str
    postgres_password: str
    postgres_db: str
    database_url: str

    class Config:
        # env_file = os.getenv("ENV_FILE", ".env")   # TODO:生产环境读取 .env，可通过 ENV_FILE 覆盖
        env_file = ".env.development"  # TODO:开发环境读取 .env.development

@lru_cache()
def get_settings():
    return Settings()