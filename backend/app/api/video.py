from fastapi import APIRouter, File, UploadFile, HTTPException
from app.services.video import video_processor

router = APIRouter()

@router.post("/process-async")
async def process_video_async(file: UploadFile = File(...)):
    """异步处理视频文件"""
    try:
        # 读取视频文件
        video_bytes = await file.read()
        
        # 文件大小检查 (可选，限制为100MB)
        if len(video_bytes) > 100 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="视频文件过大，请限制在100MB以内")
        
        # 创建异步处理任务
        task_id = await video_processor.create_task(video_bytes)
        
        return {
            "status": "success",
            "task_id": task_id,
            "message": "视频已提交处理，请使用任务ID查询结果"
        }
    except Exception as e:
        print(f"视频处理错误: {str(e)}")
        raise HTTPException(status_code=500, detail=f"处理视频时出错: {str(e)}")

@router.get("/status/{task_id}")
async def get_video_status(task_id: str):
    """获取视频处理任务状态"""
    status = await video_processor.get_task_status(task_id)
    if status.get("status") == "not_found":
        raise HTTPException(status_code=404, detail="任务不存在")
    return status

@router.get("/result/{task_id}")
async def get_video_result(task_id: str):
    """获取视频处理结果"""
    result = await video_processor.get_task_result(task_id)
    if result.get("status") == "not_found":
        raise HTTPException(status_code=404, detail="任务不存在")
    if result.get("status") in ["pending", "processing"]:
        return {"status": result["status"], "progress": result.get("progress", 0)}
    return result