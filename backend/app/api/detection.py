from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from app.core.database import get_db
from app.services.detector import detector
from app.models.detection import Detection
from typing import List
import time

router = APIRouter()

@router.post("/upload")
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

        # 不再抛出异常，而是处理没有检测到的情况
        # if not predictions:
        #     raise HTTPException(status_code=400, detail="未检测到害虫")
        
        # 生成标注图像 (只有在有检测结果时才生成)
        annotated_image = None
        if predictions:
            annotated_image = detector.annotate_image(image_bytes, predictions)
        
        # 保存到数据库 (无论是否检测到都保存记录)
        new_detection = Detection(
            image_path=f"/uploads/{file.filename}",
            annotated_path=f"/annotated/{file.filename}" if annotated_image else None,
            results=predictions,
            created_at=datetime.now()
        )
        db.add(new_detection)
        await db.commit()
        
        # 构造返回结果，增加状态标识
        return {
            "status": "success" if predictions else "no_detection",
            "message": "检测成功" if predictions else "未检测到害虫，请尝试其他图片",
            "time_cost": round(time.time() - start_time, 3),
            "results": predictions,
            "annotated_image": annotated_image  # 如果没有检测结果可能为None
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"服务器内部错误: {str(e)}")
        raise HTTPException(status_code=500, detail=f"内部错误: {str(e)}")

@router.post("/upload-multiple")
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
            
            # 生成标注图像 (只有在有检测结果时才生成)
            annotated_image = None
            if predictions:
                annotated_image = detector.annotate_image(image_bytes, predictions)
            
            # 保存到数据库
            new_detection = Detection(
                image_path=f"/uploads/{file.filename}",
                annotated_path=f"/annotated/{file.filename}" if annotated_image else None,
                results=predictions,
                created_at=datetime.now()
            )
            db.add(new_detection)
            
            # 添加到结果列表，包含检测状态信息
            results.append({
                "filename": file.filename,
                "status": "success" if predictions else "no_detection",
                "message": "检测成功" if predictions else "未检测到害虫",
                "predictions": predictions,
                "annotated_image": annotated_image
            })
        except Exception as e:
            # 记录单个文件处理失败，但继续处理其他文件
            results.append({
                "filename": file.filename,
                "status": "error",
                "message": str(e),
                "error": str(e)
            })
    
    # 提交所有数据库更改
    await db.commit()
    
    # 统计检测结果
    detection_count = sum(1 for item in results if item.get("status") == "success")
    no_detection_count = sum(1 for item in results if item.get("status") == "no_detection")
    error_count = sum(1 for item in results if item.get("status") == "error")
    
    return {
        "status": "success",
        "time_cost": round(time.time() - start_time, 3),
        "processed_count": len(results),
        "detection_stats": {
            "detected": detection_count,
            "not_detected": no_detection_count,
            "errors": error_count
        },
        "results": results
    }