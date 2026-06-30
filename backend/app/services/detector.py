from ultralytics import YOLO
from app.core.config import get_settings
<<<<<<< HEAD
from app.services.pest_translator import to_chinese, get_pest_aliases
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from typing import List, Dict, Optional
import base64
import os

settings = get_settings()


def get_chinese_font(size: int = 20) -> Optional[ImageFont.FreeTypeFont]:
    """
    查找系统中可用的中文字体。
    优先使用常见中文字体，找不到则返回 None。
    """
    # Windows 常见中文字体
    windows_fonts = [
        "C:/Windows/Fonts/simhei.ttf",       # 黑体
        "C:/Windows/Fonts/simsun.ttc",       # 宋体
        "C:/Windows/Fonts/msyh.ttc",         # 微软雅黑
        "C:/Windows/Fonts/msyhl.ttc",        # 微软雅黑 Light
        "C:/Windows/Fonts/simkai.ttf",       # 楷体
        "C:/Windows/Fonts/simfang.ttf",      # 仿宋
    ]
    # Linux 常见中文字体
    linux_fonts = [
        "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",
        "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    ]
    # macOS 常见中文字体
    macos_fonts = [
        "/System/Library/Fonts/PingFang.ttc",
        "/System/Library/Fonts/STHeiti Light.ttc",
        "/System/Library/Fonts/STHeiti Medium.ttc",
        "/Library/Fonts/Arial Unicode.ttf",
    ]

    candidates = windows_fonts + linux_fonts + macos_fonts
    for font_path in candidates:
        if os.path.exists(font_path):
            try:
                return ImageFont.truetype(font_path, size)
            except Exception:
                continue
    return None


def cv2_puttext_zh(img_bgr: np.ndarray, text: str, pos: tuple, color=(0, 255, 0),
                   font_size: int = 18) -> np.ndarray:
    """
    在 OpenCV BGR 图像上绘制中文文本，避免 cv2.putText 中文乱码。

    Args:
        img_bgr: OpenCV BGR 图像
        text: 要绘制的中文字符串
        pos: 文本左上角坐标 (x, y)
        color: 文本颜色 (B, G, R)
        font_size: 字体大小

    Returns:
        绘制后的 BGR 图像
    """
    font = get_chinese_font(font_size)
    if font is None:
        # 兜底：使用 cv2 英文字体，无法显示中文
        x, y = pos
        cv2.putText(img_bgr, text, (x, y + font_size), cv2.FONT_HERSHEY_SIMPLEX,
                    0.6, color, 2)
        return img_bgr

    # BGR -> RGB -> Pillow Image
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(img_rgb)
    draw = ImageDraw.Draw(pil_img)

    # 支持 Pillow 新旧版本
    try:
        bbox = draw.textbbox((0, 0), text, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
    except AttributeError:
        text_w, text_h = draw.textsize(text, font=font)

    x, y = pos
    # 如果文本会超出图像顶部，移到框内
    if y < text_h + 6:
        y = y + text_h + 6

    # 半透明黑色背景条，提升可读性
    draw.rectangle(
        [x, y - text_h - 2, x + text_w + 8, y + 4],
        fill=(0, 0, 0),
    )

    # 绘制文字
    draw.text((x + 4, y - text_h), text, font=font, fill=(color[2], color[1], color[0]))

    # 转回 BGR
    return cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

=======
import cv2
import numpy as np
from typing import List, Dict
import base64

settings = get_settings()

>>>>>>> origin_main
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

<<<<<<< HEAD
    def predict(self, image_bytes: bytes, conf_threshold: Optional[float] = None) -> List[Dict]:
        """执行预测"""
        try:
            img = self.preprocess(image_bytes)
            # 默认阈值降到 0.25，避免漏检
            threshold = conf_threshold if conf_threshold is not None else min(self.conf_thresh, 0.25)
            results = self.model(
                img,
                imgsz=self.img_size,
                conf=threshold,
=======
    def predict(self, image_bytes: bytes) -> List[Dict]:
        """执行预测"""
        try:
            img = self.preprocess(image_bytes)
            results = self.model(
                img, 
                imgsz=self.img_size,
                conf=self.conf_thresh,
>>>>>>> origin_main
                verbose=False  # 关闭冗余日志
            )
            return self.parse_results(results)
        except Exception as e:
            print(f"预测过程中出错: {str(e)}")
            return []
    
    def annotate_image(self, image_bytes: bytes, predictions: List[Dict]) -> str:
<<<<<<< HEAD
        """绘制标注框并返回base64编码的图像（支持中文标签）"""
        try:
            # 使用与预测相同的预处理获取RGB格式图像
            img_rgb = self.preprocess(image_bytes)
            # 转为 BGR 用于绘制
            img_bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)

            if predictions and len(predictions) > 0:
                for pred in predictions:
=======
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
>>>>>>> origin_main
                    x1 = int(pred["bbox"]["x1"])
                    y1 = int(pred["bbox"]["y1"])
                    x2 = int(pred["bbox"]["x2"])
                    y2 = int(pred["bbox"]["y2"])
<<<<<<< HEAD

                    # 根据置信度选择框颜色
                    conf = pred.get("confidence", 0)
                    if conf >= 0.8:
                        box_color = (0, 255, 0)       # 绿色 - 高
                    elif conf >= 0.6:
                        box_color = (255, 215, 0)     # 金色 - 中
                    elif conf >= 0.4:
                        box_color = (255, 140, 0)     # 橙色 - 低
                    else:
                        box_color = (128, 128, 128)   # 灰色 - 极低

                    # 绘制边界框（带一点阴影效果）
                    cv2.rectangle(img_bgr, (x1, y1), (x2, y2), box_color, 2)

                    # 中文标签
                    label_name = pred.get("class_zh") or pred.get("class", "未知")
                    label = f"{label_name} {conf:.2f}"
                    img_bgr = cv2_puttext_zh(img_bgr, label, (x1, y1 - 2), color=box_color, font_size=18)

=======
                    
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
            
>>>>>>> origin_main
            # 使用更高质量参数进行JPEG编码
            _, buffer = cv2.imencode('.jpg', img_bgr, [cv2.IMWRITE_JPEG_QUALITY, 95])
            if buffer is None:
                raise ValueError("图像编码失败")
<<<<<<< HEAD

=======
                
>>>>>>> origin_main
            base64_image = base64.b64encode(buffer).decode('utf-8')
            return f"data:image/jpeg;base64,{base64_image}"
        except Exception as e:
            print(f"标注图像时出错: {str(e)}")
            try:
<<<<<<< HEAD
=======
                # 如果标注失败，返回原始图像
>>>>>>> origin_main
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
<<<<<<< HEAD
        """解析YOLO输出结果（带中英对照）"""
        predictions = []
        for result in results:
            for box in result.boxes:
                cls_id = int(box.cls)
                en_name = result.names[cls_id]
                zh_name = to_chinese(en_name)
                predictions.append({
                    "class": zh_name,            # 主显示字段：中文名（兼容性）
                    "class_en": en_name,         # 英文原名
                    "class_zh": zh_name,         # 中文名（显式）
                    "class_id": cls_id,          # 类别 ID
                    "aliases": get_pest_aliases(en_name),  # 别名列表
=======
        """解析YOLO输出结果"""
        predictions = []
        for result in results:
            for box in result.boxes:
                predictions.append({
                    "class": result.names[int(box.cls)],
>>>>>>> origin_main
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