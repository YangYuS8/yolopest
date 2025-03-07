from typing import Dict, Any, Optional

# 用于存储视频处理进度的字典
progress_tracker = {}

# 获取进度的函数
def get_progress(client_id: str) -> int:
    """获取指定客户端ID的处理进度"""
    return progress_tracker.get(client_id, 0)

# 更新进度的函数
def update_progress(task_id: str, progress: int, progress_tracker: Dict[str, Any], 
                   status: str = None, message: str = None) -> None:
    """更新任务进度
    
    Args:
        task_id: 任务ID
        progress: 进度百分比（0-100）或-1表示错误
        progress_tracker: 进度跟踪字典
        status: 可选状态字符串
        message: 可选消息
    """
    # 确定状态
    if status is None:
        if progress == 100:
            status = "completed"
        elif progress == -1:
            status = "error"
        else:
            status = "processing"
    
    # 更新进度信息
    progress_data = {
        "progress": progress,
        "status": status
    }
    
    if message:
        progress_data["message"] = message
    
    progress_tracker[task_id] = progress_data