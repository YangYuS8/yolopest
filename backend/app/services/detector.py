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
        try:
            img = self.preprocess(image_bytes)
            results = self.model(
                img, 
                imgsz=self.img_size,
                conf=self.conf_thresh,
                verbose=False  # 关闭冗余日志
            )
            return self.parse_results(results)
        except Exception as e:
            print(f"预测过程中出错: {str(e)}")
            return []
    
    def annotate_image(self, image_bytes: bytes, predictions: List[Dict]) -> str:
        """绘制标注框并返回base64编码的图像"""
        try:
            # 使用与预测相同的预处理获取RGB格式图像
            img_rgb = self.preprocess(image_bytes)
            
            # 使用已有的预测结果，避免重复调用模型
            if predictions and len(predictions) > 0:
                # 从已有的预测结果构建要显示的边界框
                img_with_boxes = img_rgb.copy()
                
                for pred in predictions:
                    # 获取边界框坐标
                    x1 = int(pred["bbox"]["x1"])
                    y1 = int(pred["bbox"]["y1"])
                    x2 = int(pred["bbox"]["x2"])
                    y2 = int(pred["bbox"]["y2"])
                    
                    # 绘制边界框
                    cv2.rectangle(img_with_boxes, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    
                    # 绘制标签
                    label = f"{pred['class']} {pred['confidence']:.2f}"
                    cv2.putText(img_with_boxes, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 
                               0.5, (0, 255, 0), 2)
                
                # 转回BGR用于OpenCV处理
                img_bgr = cv2.cvtColor(img_with_boxes, cv2.COLOR_RGB2BGR)
            else:
                # 如果没有预测结果，使用原始图像
                img_bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)
            
            # 使用更高质量参数进行JPEG编码
            _, buffer = cv2.imencode('.jpg', img_bgr, [cv2.IMWRITE_JPEG_QUALITY, 95])
            if buffer is None:
                raise ValueError("图像编码失败")
                
            base64_image = base64.b64encode(buffer).decode('utf-8')
            return f"data:image/jpeg;base64,{base64_image}"
        except Exception as e:
            print(f"标注图像时出错: {str(e)}")
            try:
                # 如果标注失败，返回原始图像
                nparr = np.frombuffer(image_bytes, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                _, buffer = cv2.imencode('.jpg', img)
                base64_image = base64.b64encode(buffer).decode('utf-8')
                return f"data:image/jpeg;base64,{base64_image}"
            except:
                return ""
            
    def process_image(self, image_bytes: bytes):
        """整合预测和标注的完整流程"""
        try:
            # 预处理图像
            img_rgb = self.preprocess(image_bytes)
            
            # 预测
            results = self.model(
                img_rgb, 
                imgsz=self.img_size,
                conf=self.conf_thresh,
                verbose=False
            )
            
            # 解析结果
            predictions = self.parse_results(results)
            
            # 使用结果的标注图像 - 使用YOLOv12原生plot方法
            annotated_img = results[0].plot()
            annotated_img_bgr = cv2.cvtColor(annotated_img, cv2.COLOR_RGB2BGR)
            
            # 编码为base64
            _, buffer = cv2.imencode('.jpg', annotated_img_bgr, [cv2.IMWRITE_JPEG_QUALITY, 95])
            base64_image = base64.b64encode(buffer).decode('utf-8')
            
            return {
                "predictions": predictions,
                "annotated_image": f"data:image/jpeg;base64,{base64_image}"
            }
        
        except Exception as e:
            print(f"处理图像时出错: {str(e)}")
            return {
                "predictions": [],
                "annotated_image": None
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

# 全局模型实例（避免重复加载）
detector = PestDetector()