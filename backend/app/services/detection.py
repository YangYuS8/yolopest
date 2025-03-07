import cv2
import numpy as np
import base64
import time
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid
import os
import tempfile
from pathlib import Path
import concurrent.futures

from app.core.config import Settings
from app.db.repositories.detection import DetectionRepository
from ultralytics import YOLO

class DetectionService:
    """检测服务实现，处理图像检测业务逻辑"""
    
    def __init__(self, repository: DetectionRepository, settings: Settings):
        """初始化检测服务"""
        self.repository = repository
        self.settings = settings
        self.model = YOLO(settings.model_path, task="detect")
        self.img_size = settings.img_size
        self.conf_thresh = settings.conf_thresh
        print(f"[DEBUG] 模型已加载，类别标签: {self.model.names}")

    def preprocess(self, image_bytes: bytes) -> np.ndarray:
        """将字节流转换为模型输入格式"""
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        return img

    def predict(self, image_bytes: bytes) -> List[Dict]:
        """执行预测"""
        img = self.preprocess(image_bytes)
        results = self.model(
            img, 
            imgsz=self.img_size,
            conf=self.conf_thresh,
            verbose=False
        )
        return self.parse_results(results)
    
    def predict_frame(self, frame: np.ndarray, img_size: int = None, conf_thresh: float = None) -> List[Dict]:
        """预测单一帧"""
        # 使用提供的参数或默认值
        img_size = img_size or self.img_size
        conf_thresh = conf_thresh or self.conf_thresh
        
        # 执行预测
        results = self.model(
            frame, 
            imgsz=img_size,
            conf=conf_thresh,
            verbose=False
        )
        return self.parse_results(results)
    
    def _process_single_frame(self, frame, img_size, conf_thresh):
        """处理单一帧，用于多进程并行处理"""
        try:
            # 执行检测
            results = self.model(frame, imgsz=img_size, conf=conf_thresh, verbose=False)
            # 解析结果
            return self.parse_results(results)
        except Exception as e:
            print(f"帧处理错误: {str(e)}")
            # 出错时返回空结果，不中断整个流程
            return []
    
    def annotate_image(self, image_bytes: bytes, predictions: List[Dict]) -> str:
        """绘制标注框并返回base64编码的图像"""
        # 解码图像
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # 绘制检测框
        annotated_img = self.annotate_frame(img, predictions)
        
        # 将图像转换为base64编码
        _, buffer = cv2.imencode('.jpg', annotated_img)
        base64_image = base64.b64encode(buffer).decode('utf-8')
        
        return f"data:image/jpeg;base64,{base64_image}"
    
    def annotate_frame(self, frame: np.ndarray, predictions: List[Dict]) -> np.ndarray:
        """在图像帧上绘制检测结果"""
        # 创建副本以避免修改原始帧
        img = frame.copy()
        
        # 绘制检测框
        for pred in predictions:
            bbox = pred["bbox"]
            x1, y1, x2, y2 = int(bbox["x1"]), int(bbox["y1"]), int(bbox["x2"]), int(bbox["y2"])
            
            # 绘制矩形框
            cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
            
            # 准备标签文本
            label = f"{pred['class']} {pred['confidence']:.2f}"
            
            # 绘制标签背景
            (text_width, text_height), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 1)
            cv2.rectangle(img, (x1, y1 - 20), (x1 + text_width, y1), (0, 255, 0), -1)
            
            # 添加文本
            cv2.putText(img, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 1)
        
        return img
    
    async def process_image(self, filename: str, image_bytes: bytes) -> Dict[str, Any]:
        """处理单张图像并将结果保存到数据库"""
        start_time = time.time()
        
        # 执行预测
        predictions = self.predict(image_bytes)
        
        # 绘制标注
        annotated_image = self.annotate_image(image_bytes, predictions)
        
        # 构建保存路径
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        image_filename = f"{timestamp}_{filename}"
        annotated_filename = f"annotated_{timestamp}_{filename}"
        
        # 保存结果到数据库
        detection = await self.repository.create_detection(
            image_path=image_filename,
            annotated_path=annotated_filename,
            results=predictions,
            created_at=datetime.now()  # 添加当前时间作为 created_at 参数
        )
        
        # 计算处理耗时
        time_cost = time.time() - start_time
        
        return {
            "id": detection.id,
            "time_cost": round(time_cost, 3),  # 精确到毫秒
            "predictions": predictions,
            "annotated_image": annotated_image
        }
    
    @staticmethod
    def parse_results(results) -> List[Dict]:
        """解析YOLO输出结果"""
        predictions = []
        for result in results:
            for box in result.boxes:
                predictions.append({
                    "class": result.names[int(box.cls)],
                    "confidence": float(box.conf),
                    "bbox": {
                        "x1": int(box.xyxy[0][0]),
                        "y1": int(box.xyxy[0][1]),
                        "x2": int(box.xyxy[0][2]),
                        "y2": int(box.xyxy[0][3])
                    }
                })
        return predictions