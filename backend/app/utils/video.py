import cv2
import os
from typing import Tuple

def get_video_codec() -> Tuple[int, str]:
    """获取适合平台的视频编解码器"""
    # 智能选择适合当前平台的编解码器
    if os.name == 'nt':  # Windows
        try:
            # 首选VP80（WebM格式）
            fourcc = cv2.VideoWriter_fourcc(*'VP80')
            ext = ".webm"
        except Exception:
            # 备用MJPG（AVI格式）
            fourcc = cv2.VideoWriter_fourcc(*'MJPG')
            ext = ".avi" 
    else:  # Linux/Mac
        try:
            # 首选VP80
            fourcc = cv2.VideoWriter_fourcc(*'VP80')
            ext = ".webm"
        except Exception:
            # 备用MP4V
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            ext = ".mp4"
    
    return fourcc, ext