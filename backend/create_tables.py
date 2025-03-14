import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.models.detection import Base
from app.core.config import get_settings
from app.models.history import History  # 添加这一行，导入 History 模型

async def create_tables():
    settings = get_settings()
    engine = create_async_engine(settings.database_url)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    await engine.dispose()
    print("数据库表已创建完成")

if __name__ == "__main__":
    asyncio.run(create_tables())