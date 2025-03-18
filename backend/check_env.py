import os
from app.core.config import get_settings
import sys

# 清除任何可能的缓存
sys.modules.pop('app.core.config', None)
sys.modules.pop('app.core.database', None)

# 检查环境变量
print("环境变量:")
print(f"DATABASE_URL = {os.getenv('DATABASE_URL', '未设置')}")

# 检查设置对象
settings = get_settings()
print("\n设置对象:")
print(f"DATABASE_URL = {settings.DATABASE_URL}")

# 检查是否有其他变量影响数据库连接
env_vars = [var for var in os.environ if "DB" in var.upper() or "POSTGRES" in var.upper()]
if env_vars:
    print("\n可能影响数据库连接的其他环境变量:")
    for var in env_vars:
        print(f"{var} = {os.environ[var]}")