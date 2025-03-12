from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import get_settings
import logging

settings = get_settings()
DATABASE_URL = settings.database_url

engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

logger = logging.getLogger(__name__)

async def get_db():
    db = AsyncSession(engine)
    logger.debug("数据库会话创建成功")
    try:
        yield db
    except Exception as e:
        logger.error(f"数据库会话操作失败: {str(e)}", exc_info=True)
        await db.rollback()  # 确保在异常时回滚
        raise
    finally:
        await db.close()
        logger.debug("数据库会话已关闭")