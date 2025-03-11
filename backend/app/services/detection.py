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
import asyncio
import logging

from app.core.config import Settings
from app.db.repositories.detection import DetectionRepository
from ultralytics import YOLO
from app.schemas.detection import PredictionResult, BatchDetectionResult

# 设置日志记录器
logger = logging.getLogger(__name__)

class DetectionService:
    """检测服务实现，处理图像检测业务逻辑"""
    
    def __init__(self, repository: DetectionRepository, settings: Settings):
        """初始化检测服务"""
        self.repository = repository
        self.settings = settings
        self.model = YOLO(settings.model_path, task="detect")
        self.img_size = settings.img_size
        self.conf_thresh = settings.conf_thresh
        logger.info(f"模型已加载，类别标签: {self.model.names}")
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
        """处理单个图像并返回结果"""
        try:
            # 执行图像预测
            start_time = time.time()
            predictions = self.predict(image_bytes)
            
            # 为图像生成唯一文件名
            current_time = datetime.now().strftime('%Y%m%d_%H%M%S')
            unique_filename = f"{current_time}_{filename}"
            annotated_filename = f"annotated_{unique_filename}"
            
            # 保存原始图像和标注图像
            image_path = os.path.join(self.upload_dir, unique_filename)
            annotated_path = os.path.join(self.upload_dir, annotated_filename)
            
            # 保存原始图像
            with open(image_path, "wb") as f:
                f.write(image_bytes)
                
            # 生成带标注的图像并保存
            annotated_image = self.annotate_image(image_bytes, predictions)
            annotated_image.save(annotated_path)
            
            # 将图像路径转换为URL
            annotated_url = f"{self.base_url}/uploads/{annotated_filename}"
            
            # 保存到数据库
            detection = await self.detection_repo.create({
                "image_path": unique_filename,
                "annotated_path": annotated_filename,
                "results": predictions,
                "created_at": datetime.now()
            })
            
            # 确保预测结果的格式与前端期望的一致
            processed_predictions = []
            for pred in predictions:
                processed_predictions.append({
                    "class": pred.get("class", "unknown"),
                    "confidence": pred.get("confidence", 0),
                    "bbox": pred.get("bbox", {})
                })
            
            result = {
                "id": detection.id,
                "time_cost": round(time.time() - start_time, 3),
                "predictions": processed_predictions,
                "annotated_image": annotated_url
            }
            
            return result
        except Exception as e:
            logger.error(f"处理图像 {filename} 时出错: {str(e)}")
            raise
    
    async def process_multiple_images(self, files_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """批量处理图像并返回结果"""
        start_time = time.time()
        results = []
        
        # 限制并发处理数量
        max_concurrent = min(5, os.cpu_count() or 4)
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def process_single_file(file_data):
            async with semaphore:
                try:
                    # 处理单个文件
                    filename = file_data["filename"]
                    content = file_data["content"]
                    
                    # 1. 为图像生成唯一文件名
                    current_time = datetime.now().strftime('%Y%m%d_%H%M%S')
                    unique_filename = f"{current_time}_{filename}"
                    annotated_filename = f"annotated_{unique_filename}"
                    
                    # 2. 执行预测
                    predictions = await self.predict(content)
                    
                    # 3. 生成标注图像
                    annotated_image = await self.annotate_image(content, predictions)
                    
                    # 4. 保存图像和结果
                    # 假设这里有保存逻辑
                    
                    # 5. 返回结果
                    return {
                        "filename": filename,
                        "predictions": predictions or [],  # 确保返回列表而非None
                        "annotated_image": f"/uploads/{annotated_filename}",
                        "success": True
                    }
                except Exception as e:
                    # 记录错误但继续处理其他文件
                    logger.error(f"处理 {file_data['filename']} 时出错: {str(e)}")
                    return {
                        "filename": file_data['filename'],
                        "predictions": [],  # 返回空列表而非None
                        "error": str(e),
                        "success": False
                    }
        
        # 创建处理任务
        tasks = []
        for file_data in files_data:
            task = asyncio.create_task(process_single_file(file_data))
            tasks.append(task)
        
        # 等待所有任务完成
        file_results = await asyncio.gather(*tasks)
        
        # 收集所有结果
        results = file_results
        
        # 计算成功处理的图片数量
        success_count = sum(1 for r in results if r.get("success", False))
        
        return {
            "time_cost": round(time.time() - start_time, 3),
            "processed_count": len(results),
            "success_count": success_count,
            "results": results
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