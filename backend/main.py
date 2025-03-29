from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import get_settings
from app.api.router import router  # 使用新的路由聚合
from app.api import video  # 添加这一行导入视频模块
from app.api import history  # 保留原有路由
from app.core.middleware import ErrorHandlingMiddleware
import uvicorn
import logging
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'ultralytics'))

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()
app = FastAPI(title="YoloPest API", debug=settings.debug)

# 解决跨域问题
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],  # 或者其他实际的前端URL
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
    expose_headers=["Content-Disposition"],
)

# 添加全局错误处理中间件
app.add_middleware(ErrorHandlingMiddleware)

# 确保静态文件目录存在
os.makedirs(os.path.join("app", "static"), exist_ok=True)
os.makedirs(os.path.join("app", "static", "videos"), exist_ok=True)

# 挂载静态文件服务
app.mount("/api/static", StaticFiles(directory=os.path.join("app", "static")), name="static")

# 挂载API路由
app.include_router(router, prefix="/api")
app.include_router(history.router, prefix="/api")  # 保留原有路由

# 添加视频处理路由 - 添加这部分代码
app.include_router(
    video.router,
    prefix="/api/video",
    tags=["video"]
)

@app.get("/")
async def health_check():
    return {"status": "backend is running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)