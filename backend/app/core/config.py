from pydantic_settings import BaseSettings
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

    class Config:
        env_file = ".env.development"

@lru_cache()
def get_settings():
    return Settings()