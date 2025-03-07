import uvicorn
from app.core.config import get_settings
from app.api.router import api_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

def create_app() -> FastAPI:
    settings = get_settings()
    
    app = FastAPI(
        title="Pest Detection API", 
        description="API for detecting pests in images and videos",
        version="1.0.0",
        debug=settings.debug
    )
    
    # 配置CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # 生产环境应限制为前端地址
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # 包含API路由
    app.include_router(api_router)
    
    @app.get("/")
    async def health_check():
        return {"status": "backend is running"}
    
    return app

app = create_app()

if __name__ == "__main__":
    settings = get_settings()
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=settings.debug)