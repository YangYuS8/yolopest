from fastapi import APIRouter, Depends, HTTPException
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.core.database import get_db
from app.models.history import History
from app.schemas.history import HistoryCreate, HistoryResponse
from sqlalchemy import select, delete
import uuid
from datetime import datetime, timezone
from app.core.users import current_active_user, current_superuser
from app.models.user import User

# 设置日志
logger = logging.getLogger(__name__)

# 修改前缀为一致格式
router = APIRouter()

@router.post("/", response_model=HistoryResponse)
async def create_history(
    history: HistoryCreate,
    db: AsyncSession = Depends(get_db)
):
    """创建历史记录"""
    try:
        logger.info(f"尝试创建历史记录: {history.filename}, 类型: {history.type}")
        
        # 如果未提供 ID，则生成一个
        if not history.id:
            history.id = str(uuid.uuid4())
        
        # 确保有时间戳并处理时区问题
        current_time = datetime.now()
        if history.timestamp:
            # 移除时区信息，使用本地时间
            if history.timestamp.tzinfo:
                # 将时区转换为本地时间，然后去掉时区信息
                history.timestamp = history.timestamp.astimezone().replace(tzinfo=None)
        else:
            history.timestamp = current_time
        
        logger.debug(f"创建历史记录，结果大小: {len(str(history.result)) if history.result else 0} 字符")
        
        # 在创建历史记录的地方添加数据瘦身处理
        record_type = history.type
        result = history.result

        # 如果是视频结果，只保存关键统计信息而不是完整结果
        if record_type == "video" and isinstance(result, dict) and "results" in result:
            # 提取统计数据
            stats = {
                "status": result.get("status", ""),
                "processed_frames": result.get("processed_frames", 0),
                "time_cost": result.get("time_cost", 0),
                "fps": result.get("fps", 0),
                "video_length": result.get("video_length", 0),
                "task_id": result.get("task_id", ""),
                "annotated_video_url": result.get("annotated_video_url", "")
            }
            # 只存储少量检测结果样本（最多5个）
            if result.get("results") and isinstance(result["results"], list) and len(result["results"]) > 0:
                stats["result_samples"] = result["results"][:min(5, len(result["results"]))]
            
            # 替换完整结果
            result = stats
        
        db_history = History(
            id=history.id,
            timestamp=history.timestamp,
            type=history.type,
            filename=history.filename,
            thumbnail=history.thumbnail,
            result=result
        )
        
        db.add(db_history)
        await db.commit()
        await db.refresh(db_history)
        
        logger.info(f"历史记录创建成功: {db_history.id}")
        return db_history.to_dict()
    except Exception as e:
        logger.error(f"创建历史记录失败: {str(e)}", exc_info=True)
        await db.rollback()  # 添加回滚操作
        raise HTTPException(status_code=500, detail=f"创建历史记录时发生错误: {str(e)}")

@router.get("/", response_model=List[HistoryResponse])
async def get_history_records(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    type: Optional[str] = None
):
    """获取历史记录列表"""
    query = select(History).order_by(History.timestamp.desc()).offset(skip).limit(limit)
    
    if type:
        query = query.where(History.type == type)
        
    result = await db.execute(query)
    records = result.scalars().all()
    return [record.to_dict() for record in records]

@router.get("/{history_id}", response_model=HistoryResponse)
async def get_history_record(
    history_id: str,
    db: AsyncSession = Depends(get_db)
):
    """获取单个历史记录"""
    result = await db.execute(select(History).where(History.id == history_id))
    record = result.scalars().first()
    
    if not record:
        raise HTTPException(status_code=404, detail="历史记录不存在")
        
    return record.to_dict()

@router.delete("/{history_id}", status_code=204)
async def delete_history_record(
    history_id: str,
    db: AsyncSession = Depends(get_db)
):
    """删除历史记录"""
    result = await db.execute(select(History).where(History.id == history_id))
    record = result.scalars().first()
    
    if not record:
        raise HTTPException(status_code=404, detail="历史记录不存在")
        
    await db.execute(delete(History).where(History.id == history_id))
    await db.commit()
    
    return None

@router.delete("/", status_code=204)
async def delete_all_history_records(
    db: AsyncSession = Depends(get_db)
):
    """清空所有历史记录"""
    await db.execute(delete(History))
    await db.commit()
    
    return None