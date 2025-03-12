from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.api.router import router
from app.routers import history
import uvicorn
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)

settings = get_settings()
app = FastAPI(debug=settings.debug)

# 解决跨域问题
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源，正式环境应限制为前端地址
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载路由
app.include_router(router, prefix="/api")
# 注意这里的路由前缀配置
app.include_router(history.router, prefix="/api")

@app.get("/")
async def health_check():
    return {"status": "backend is running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)