from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from typing import List
from app.core.deps import DetectionSvc

router = APIRouter()

@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    detection_service: DetectionSvc = None
):
    try:
        # 读取图片字节流
        image_bytes = await file.read()
        
        # 执行预测
        predictions = detection_service.predict(image_bytes)

        # 主动抛出 400 错误
        if not predictions:
            raise HTTPException(status_code=400, detail="未检测到害虫")
        
        # 处理图像并保存结果
        result = await detection_service.process_image(file.filename, image_bytes)
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"服务器内部错误: {str(e)}")
        raise HTTPException(status_code=500, detail=f"内部错误: {str(e)}")

@router.post("/upload-multiple")
async def upload_multiple_images(
    files: List[UploadFile] = File(...),
    detection_service: DetectionSvc = None
):
    if not files:
        raise HTTPException(status_code=400, detail="未提供文件")
    
    # 准备文件数据列表
    files_data = []
    for file in files:
        # 读取图片字节流
        image_bytes = await file.read()
        files_data.append({
            "filename": file.filename,
            "content": image_bytes
        })
    
    # 批量处理图像
    result = await detection_service.process_multiple_images(files_data)
    
    return result