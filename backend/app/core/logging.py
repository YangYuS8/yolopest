import logging
import sys
import os
from logging.handlers import RotatingFileHandler
from pathlib import Path

def setup_logging(app_name="pest_detection", log_level=logging.DEBUG):
    """
    配置全局日志系统
    
    Args:
        app_name: 应用名称
        log_level: 日志级别
    """
    # 创建日志目录
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # 创建格式化器
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # 控制台处理器
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    
    # 文件处理器 - 普通日志
    file_handler = RotatingFileHandler(
        log_dir / "app.log", 
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setFormatter(formatter)
    
    # 文件处理器 - 错误日志
    error_handler = RotatingFileHandler(
        log_dir / "error.log", 
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(formatter)
    
    # 配置根日志器
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)
    root_logger.addHandler(error_handler)
    
    # 设置FastAPI日志级别
    logging.getLogger("fastapi").setLevel(logging.INFO)
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)
    
    # 应用相关日志器
    app_logger = logging.getLogger(app_name)
    app_logger.setLevel(log_level)
    
    return app_logger

# 导出logger实例
app_logger = setup_logging()