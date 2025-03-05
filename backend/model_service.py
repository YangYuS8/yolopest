from ultralytics import YOLO
from config import get_settings
import cv2
import numpy as np
from typing import List, Dict

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