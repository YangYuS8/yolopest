import uvicorn
from app.core.config import get_settings
from app.api.router import api_router
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.logging import app_logger as logger  # 导入预配置的日志器

def create_app() -> FastAPI:
    settings = get_settings()
    
    logger.info(f"启动应用，环境: {'开发模式' if settings.debug else '生产模式'}")
    
    app = FastAPI(
        title="Pest Detection API", 
        description="API for detecting pests in images and videos",
        version="1.0.0",
        debug=settings.debug
    )
    
    # 配置CORS
    logger.debug(f"配置CORS: 允许来源 {['http://localhost:3000']}")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"], # 明确指定前端开发服务器的域名
        allow_credentials=True,                 # 允许携带凭证
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # 包含API路由
    app.include_router(api_router)
    
    @app.get("/")
    async def health_check():
        return {"status": "backend is running"}
    
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        path = request.url.path
        # 排除静态资源和健康检查的详细日志
        if not (path.startswith("/static") or path == "/"):
            logger.debug(f"收到请求: {request.method} {path} 来自: {request.client.host if request.client else 'unknown'}")
        
        try:
            response = await call_next(request)
            
            # 记录4xx和5xx的详细响应日志
            if response.status_code >= 400:
                logger.warning(f"请求失败: {request.method} {path} - 状态码: {response.status_code}")
            elif not (path.startswith("/static") or path == "/"):
                logger.debug(f"请求完成: {request.method} {path} - 状态码: {response.status_code}")
                
            return response
        except Exception as e:
            logger.exception(f"请求处理异常: {request.method} {path} - 错误: {str(e)}")
            raise
    
    # 应用启动和关闭事件
    @app.on_event("startup")
    async def startup_event():
        logger.info("应用已启动")
        
    @app.on_event("shutdown")
    async def shutdown_event():
        logger.info("应用正在关闭")
    
    return app

app = create_app()

if __name__ == "__main__":
    settings = get_settings()
    logger.info(f"以开发模式启动服务器: host=0.0.0.0, port=8000")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=settings.debug)