from fastapi import FastAPI, File, UploadFile, HTTPException  # 添加 HTTPException
from fastapi.middleware.cors import CORSMiddleware
from model_service import detector  # 导入模型服务
from config import get_settings
import uvicorn
from typing import Optional
import time

settings = get_settings()   # 调用函数获取配置实例
app = FastAPI(debug=settings.debug)

# 解决跨域问题（重要！）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源，正式环境应限制为前端地址
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def health_check():
    return {"status": "backend is running"}

@app.post("/api/upload")
async def upload_image(file: UploadFile = File(...)):
    try:
        # 读取图片字节流
        start_time = time.time()
        image_bytes = await file.read()
        
        # 执行预测
        predictions = detector.predict(image_bytes)

        # 主动抛出 400 错误（使用正确参数名）
        if not predictions:
            raise HTTPException(status_code=400, detail="未检测到害虫")

        # 构造返回结果
        return {
            "status": "success",
            "time_cost": round(time.time() - start_time, 3),
            "results": predictions
        }
    except HTTPException:
        # 直接传递已抛出的 HTTP 异常
        raise
    except Exception as e:
        # 捕获其他未知异常，返回 500
        print(f"服务器内部错误: {str(e)}")
        raise HTTPException(status_code=500, detail=f"内部错误: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)