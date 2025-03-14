from ultralytics import YOLO
from app.core.config import get_settings
import cv2
import numpy as np
from typing import List, Dict
import base64

settings = get_settings()

class PestDetector:
    def __init__(self):
        print(f"[DEBUG] 正在加载模型，路径: {settings.model_path}")
        self.model = YOLO(settings.model_path, task="detect")
        print("[DEBUG] 模型类别标签:", self.model.names)  # 打印模型支持的类别
        self.img_size = settings.img_size
        self.conf_thresh = settings.conf_thresh

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
            verbose=False  # 关闭冗余日志
        )
        return self.parse_results(results)
    
    def annotate_image(self, image_bytes: bytes, predictions: List[Dict]) -> str:
        """绘制标注框并返回base64编码的图像"""
        # 解码图像
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
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
        
        # 将图像转换为base64编码
        _, buffer = cv2.imencode('.jpg', img)
        base64_image = base64.b64encode(buffer).decode('utf-8')
        
        return f"data:image/jpeg;base64,{base64_image}"

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

# 全局模型实例（避免重复加载）
detector = PestDetector()