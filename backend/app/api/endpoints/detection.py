from fastapi import APIRouter, File, UploadFile, HTTPException, Form, Request, Depends
from typing import List, Dict, Any, Optional
from app.core.deps import get_detection_service
from app.services.detection import DetectionService  # 直接添加此导入
import app.schemas.detection as schemas  # 修改为显式导入
from datetime import datetime
import logging
import traceback
import json
import uuid
import time
import asyncio
import os

# 创建专用日志器
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/upload")
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    detection_service: DetectionService = Depends(get_detection_service)
):
    # 生成请求ID用于跟踪
    request_id = str(uuid.uuid4())
    logger.info(f"[{request_id}] 开始处理单图像上传请求: {file.filename}, 大小: {file.size if hasattr(file, 'size') else '未知'}")
    
    try:
        # 记录客户端信息
        client_host = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        logger.debug(f"[{request_id}] 客户端信息: {client_host}, User-Agent: {user_agent}")
        
        # 读取图片字节流
        image_bytes = await file.read()
        logger.debug(f"[{request_id}] 成功读取图像数据: {len(image_bytes)} 字节")
        
        # 执行预测
        logger.debug(f"[{request_id}] 开始执行图像预测")
        predictions = detection_service.predict(image_bytes)
        logger.debug(f"[{request_id}] 预测完成，结果数量: {len(predictions) if predictions else 0}")

        # 检查预测结果
        if not predictions:
            logger.warning(f"[{request_id}] 未检测到害虫: {file.filename}")
            raise HTTPException(
                status_code=400, 
                detail={
                    "code": "NO_PEST_DETECTED",
                    "message": "未检测到害虫，请尝试其他图片",
                    "status": "error"
                }
            )
        
        # 处理图像并保存结果
        logger.debug(f"[{request_id}] 开始处理图像并保存结果")
        result = await detection_service.process_image(file.filename, image_bytes)
        logger.info(f"[{request_id}] 图像处理成功，ID: {result.get('id', 'unknown')}, 耗时: {result.get('time_cost', 0)}秒")
        
        return {
            "status": "success",
            "data": result
        }
    except HTTPException as he:
        # 记录HTTP异常但不修改它们
        logger.warning(f"[{request_id}] HTTP异常: {he.status_code} - {he.detail}")
        raise
    except Exception as e:
        # 详细错误日志
        error_detail = traceback.format_exc()
        error_id = str(uuid.uuid4())
        
        # 结构化错误日志
        error_log = {
            "error_id": error_id,
            "request_id": request_id,
            "timestamp": datetime.now().isoformat(),
            "file_name": file.filename,
            "exception_type": type(e).__name__,
            "exception_msg": str(e),
            "stacktrace": error_detail
        }
        
        # 打印格式化的错误日志
        logger.error(f"[{request_id}] 处理图像时发生错误 (error_id: {error_id}):\n{json.dumps(error_log, indent=2, ensure_ascii=False)}")
        
        raise HTTPException(
            status_code=500, 
            detail={
                "code": "INTERNAL_ERROR",
                "message": f"服务器内部错误 (ID: {error_id})",
                "status": "error",
                "error_id": error_id  # 添加错误ID方便追踪
            }
        )

@router.post("/upload-multiple", response_model=schemas.BatchDetectionResponse)
async def upload_multiple_images(
    request: Request,
    files: List[UploadFile] = File(...),
    detection_service: DetectionService = Depends(get_detection_service)
) -> schemas.BatchDetectionResponse:
    """
    批量上传图像进行害虫检测，返回检测结果
    """
    request_id = str(uuid.uuid4())
    log_prefix = f"[{request_id}]"
    
    logger.info(f"{log_prefix} 开始批量图像处理请求: {len(files)}个文件")
    logger.debug(f"{log_prefix} 批量处理客户端: {request.client.host}, 文件数量: {len(files)}")
    
    files_data = []
    
    # 读取所有上传的文件
    for i, file in enumerate(files):
        try:
            logger.debug(f"{log_prefix} 读取第{i+1}个文件: {file.filename}")
            content = await file.read()
            logger.debug(f"{log_prefix} 文件 {file.filename} 读取完成: {len(content)} 字节")
            files_data.append({"filename": file.filename, "content": content})
        except Exception as e:
            logger.error(f"{log_prefix} 读取文件 {file.filename} 失败: {str(e)}")
            
    logger.debug(f"{log_prefix} 开始批量处理 {len(files_data)} 个图像")
    
    try:
        # 批量处理图像
        start_time = time.time()
        result = await detection_service.process_multiple_images(files_data)
        time_cost = time.time() - start_time
        
        # 计算处理结果统计
        success_count = sum(1 for r in result["results"] if r.get("success", False))
        
        logger.info(f"{log_prefix} 批量处理完成，处理了 {len(files_data)} 个文件，总耗时: {time_cost:.3f} 秒")
        logger.info(f"{log_prefix} 处理结果统计: 成功 {success_count}, 失败 {len(files_data) - success_count}")
        
        return {
            "status": "success",
            "message": f"成功处理了{success_count}/{len(files_data)}个文件",
            "time_cost": round(time_cost, 3),
            "processed_count": len(files_data),
            "success_count": success_count,
            "results": result["results"]
        }
    except Exception as e:
        # 错误处理逻辑
        error_id = str(uuid.uuid4())
        error_data = {
            "error_id": error_id,
            "batch_id": request_id,
            "timestamp": datetime.now().isoformat(),
            "file_count": len(files_data),
            "filenames": [f["filename"] for f in files_data[:5]] + (["...更多"] if len(files_data) > 5 else []),
            "exception_type": type(e).__name__,
            "exception_msg": str(e),
            "stacktrace": traceback.format_exc()
        }
        logger.error(f"{log_prefix} 批量处理图像时发生错误 (error_id: {error_id}):\n{json.dumps(error_data, indent=2, ensure_ascii=False)}")
        
        raise HTTPException(
            status_code=500,
            detail={
                "code": "BATCH_PROCESSING_ERROR",
                "message": f"批量处理错误 (ID: {error_id})",
                "error_id": error_id,
                "status": "error"
            }
        )