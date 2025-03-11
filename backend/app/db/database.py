from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import get_settings

settings = get_settings()

# 确保使用正确的数据库名称
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,  # 调试模式下打印SQL语句
    pool_pre_ping=True,   # 连接池健康检查
    pool_size=10,         # 连接池大小
    max_overflow=20       # 最大溢出连接数
)

# 创建异步会话工厂
AsyncSessionLocal = sessionmaker(
    engine,
    expire_on_commit=False,
    class_=AsyncSession
)