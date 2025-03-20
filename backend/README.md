# YoloPest 后端

基于 FastAPI + YOLOv12 构建的智能害虫检测系统后端，提供图像识别、视频分析和用户管理等核心功能。

## 技术栈

-   **FastAPI** - 高性能 Python API 框架
-   **YOLOv12** - 目标检测模型（本地定制版）
-   **SQLAlchemy** - ORM 数据库映射
-   **Redis** - 缓存与会话管理
-   **Uvicorn** - ASGI 服务器
-   **Pydantic** - 数据验证
-   **OpenCV** - 图像处理
-   **Docker** - 容器化部署

## 主要功能

-   ✅ RESTful API 接口
-   ✅ 用户认证与授权
-   ✅ 图像害虫检测分析
-   ✅ 视频处理与分析
-   ✅ 检测历史记录管理
-   ✅ 自定义 YOLOv12 模型集成
-   ✅ 静态资源管理

## 快速开始

### 环境要求

-   Python 3.8+
-   Redis 7+
-   OpenCV 依赖

### 开发环境

```bash
# 创建并激活虚拟环境
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# 或 .venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt

# 安装本地修改的YOLOv12
pip install -e ./ultralytics

# 初始化数据库表结构
python create_tables.py

# 启动服务
uvicorn main:app --reload
```

访问 API 文档：http://localhost:8000/docs

## 项目结构

```
backend/
├── app/                # 应用核心代码
│   ├── api/            # API路由和处理函数
│   ├── core/           # 配置和基础设施
│   ├── models/         # 数据库模型
│   ├── schemas/        # Pydantic模型
│   ├── services/       # 业务逻辑
│   └── static/         # 静态资源
├── ultralytics/        # 自定义修改的YOLOv12代码
├── main.py             # 应用入口
├── requirements.txt    # 依赖库
└── create_tables.py    # 数据库初始化
```

## API 接口示例

### 图像检测接口

```http
POST /api/detection/image
Content-Type: multipart/form-data

Response:
{
    "status": "success",
    "results": [
        {
            "class": "褐飞虱",
            "confidence": 0.95,
            "bbox": {
                "x1": 120,
                "y1": 50,
                "x2": 220,
                "y2": 130
            }
        }
    ],
    "annotated_image": "base64编码图像..."
}
```

## YOLOv12 集成

PestDetector 类负责模型加载和推理：

```python
from ultralytics import YOLO

class PestDetector:
    def __init__(self):
        self.model = YOLO(settings.model_path, task="detect")
        self.img_size = settings.img_size
        self.conf_thresh = settings.conf_thresh

    def predict(self, image_bytes: bytes) -> List[Dict]:
        """执行预测"""
        img = self.preprocess(image_bytes)
        results = self.model(img, size=self.img_size, conf=self.conf_thresh)
        return self.parse_results(results)
```

## 常见问题

### Q: 模型加载失败

安装 OpenCV 并检查模型路径：

```bash
pip install opencv-python-headless==4.11.0.86
```

### Q: 本地修改的 YOLOv12 如何应用

安装为开发模式：

```bash
pip install -e ./ultralytics
```

### Q: 上传文件存储位置

默认存储在临时目录：

```python
uploads_dir = os.path.join(tempfile.gettempdir(), "yolopest_uploads")
os.makedirs(uploads_dir, exist_ok=True)
```

## 许可证

GPL-3.0 license
