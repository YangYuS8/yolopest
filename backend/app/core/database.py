from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from typing import AsyncGenerator
from app.core.config import get_settings
import logging

settings = get_settings()
# 使用大写变量名以保持一致性
DATABASE_URL = settings.DATABASE_URL

engine = create_async_engine(DATABASE_URL)
async_session_maker = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

logger = logging.getLogger(__name__)
logger.info(f"连接到数据库: {DATABASE_URL}")  # 添加日志以帮助调试

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session