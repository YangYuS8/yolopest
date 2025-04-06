import os
from dotenv import load_dotenv
import uvicorn

# 明确加载特定的环境文件
load_dotenv(".env.development")  # 或 .env.production

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)