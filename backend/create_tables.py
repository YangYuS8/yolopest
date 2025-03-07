import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from app.db.database import engine
from app.db.models import Base  # 修正导入路径

async def create_tables():
    """创建数据库表"""
    async with engine.begin() as conn:
        # 在开发模式下可以删除现有表（谨慎使用）
        # await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    await engine.dispose()
    print("数据库表已创建完成")

if __name__ == "__main__":
    asyncio.run(create_tables())