from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import time
from typing import Dict, Any
from app.core.deps import ProgressTracker

router = APIRouter()

MAX_WAIT_TIME = 3600  # 最大等待时间（秒）

@router.websocket("/video/{task_id}")
async def websocket_endpoint(websocket: WebSocket, task_id: str, progress_tracker: ProgressTracker):
    """视频处理WebSocket端点，用于实时推送处理进度"""
    await websocket.accept()
    start_time = time.time()
    try:
        # 发送初始状态
        progress_info = progress_tracker.get(task_id, {"status": "waiting", "progress": 0})
        await websocket.send_json(progress_info)
        
        # 持续推送更新
        while True:
            try:
                # 检查是否超时
                if time.time() - start_time > MAX_WAIT_TIME:
                    await websocket.send_json({
                        "status": "error", 
                        "progress": -1,
                        "error": "处理超时"
                    })
                    break
                
                # 获取最新进度
                progress_info = progress_tracker.get(task_id, {"status": "unknown", "progress": 0})
                
                # 检查是否有完整结果
                if f"{task_id}_result" in progress_tracker:
                    await websocket.send_json({
                        "status": "completed",
                        "progress": 100,
                        "result": progress_tracker[f"{task_id}_result"]
                    })
                    break
                
                # 检查是否有错误
                if f"{task_id}_error" in progress_tracker:
                    await websocket.send_json({
                        "status": "error",
                        "progress": -1,
                        "error": progress_tracker[f"{task_id}_error"]
                    })
                    break
                
                # 检查是否有中间数据
                if f"{task_id}_data" in progress_tracker:
                    await websocket.send_json(progress_tracker[f"{task_id}_data"])
                else:
                    await websocket.send_json(progress_info)
                    
                # 等待一段时间再次检查
                await asyncio.sleep(1)
            except Exception as e:
                print(f"处理任务 {task_id} 时出错: {str(e)}")
                await websocket.send_json({
                    "status": "error",
                    "progress": -1,
                    "error": f"服务器内部错误: {str(e)}"
                })
                break
                
    except WebSocketDisconnect:
        print(f"客户端已断开连接: {task_id}")
    except Exception as e:
        print(f"WebSocket连接错误: {str(e)}")