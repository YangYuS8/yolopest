import asyncio
from app.core.database import get_db, engine
from sqlalchemy import text

async def check_database():
    try:
        async with engine.begin() as conn:
            # 测试基本连接
            result = await conn.execute(text("SELECT 1"))
            print("数据库连接成功!", result.scalar())
            
            # 检查用户表是否存在
            result = await conn.execute(text(
                "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')"
            ))
            if result.scalar():
                print("表 'users' 已存在")
            else:
                print("表 'users' 不存在，请运行 create_tables.py")
    except Exception as e:
        print(f"数据库连接失败: {str(e)}")

if __name__ == "__main__":
    asyncio.run(check_database())