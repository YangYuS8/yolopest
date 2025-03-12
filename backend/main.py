from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from model_service import detector  # 导入模型服务
from config import get_settings
import uvicorn
from typing import Optional, List
import time
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models import Detection
from datetime import datetime

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

@app.post("/api/detection/upload")
async def upload_image(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    try:
        # 读取图片字节流
        start_time = time.time()
        image_bytes = await file.read()
        
        # 执行预测
        predictions = detector.predict(image_bytes)

        # 主动抛出 400 错误（使用正确参数名）
        if not predictions:
            raise HTTPException(status_code=400, detail="未检测到害虫")
        
        # 生成标注图像
        annotated_image = detector.annotate_image(image_bytes, predictions)
        
        # 保存到数据库
        new_detection = Detection(
            image_path=f"/uploads/{file.filename}",
            annotated_path=f"/annotated/{file.filename}",
            results=predictions,
            created_at=datetime.now()
        )
        db.add(new_detection)
        await db.commit()
        
        # 构造返回结果
        return {
            "status": "success",
            "time_cost": round(time.time() - start_time, 3),
            "results": predictions,
            "annotated_image": annotated_image  # 返回标注后的图像
        }
    except HTTPException:
        # 直接传递已抛出的 HTTP 异常
        raise
    except Exception as e:
        # 捕获其他未知异常，返回 500
        print(f"服务器内部错误: {str(e)}")
        raise HTTPException(status_code=500, detail=f"内部错误: {str(e)}")

@app.post("/api/detection/upload-multiple")
async def upload_multiple_images(
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db)
):
    if not files:
        raise HTTPException(status_code=400, detail="未提供文件")
    
    start_time = time.time()
    results = []
    
    for file in files:
        try:
            # 读取图片字节流
            image_bytes = await file.read()
            
            # 执行预测
            predictions = detector.predict(image_bytes)
            
            # 生成标注图像
            annotated_image = detector.annotate_image(image_bytes, predictions)
            
            # 保存到数据库
            new_detection = Detection(
                image_path=f"/uploads/{file.filename}",
                annotated_path=f"/annotated/{file.filename}",
                results=predictions,
                created_at=datetime.now()
            )
            db.add(new_detection)
            
            # 添加到结果列表
            results.append({
                "filename": file.filename,
                "predictions": predictions,
                "annotated_image": annotated_image
            })
        except Exception as e:
            # 记录单个文件处理失败，但继续处理其他文件
            results.append({
                "filename": file.filename,
                "error": str(e)
            })
    
    # 提交所有数据库更改
    await db.commit()
    
    return {
        "status": "success",
        "time_cost": round(time.time() - start_time, 3),
        "processed_count": len(results),
        "results": results
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)