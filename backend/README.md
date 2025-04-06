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
python start.py
```

访问 API 文档：http://localhost:8000/docs

## 系统架构

### 核心组件

-   **认证服务** - 处理用户登录、注册和权限验证
-   **检测服务** - 封装 YOLOv12 模型，提供图像分析能力
-   **视频处理服务** - 异步处理视频文件并逐帧分析
-   **历史记录服务** - 管理用户的检测历史
-   **数据持久化** - 使用 SQLAlchemy 进行 ORM 映射

### 数据流程

1. 客户端上传图像/视频 → API 接收
2. 数据预处理 → 模型推理
3. 结果解析与后处理 → 图像标注
4. 返回 JSON 结果与标注图像
5. 记录历史并提供查询

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

## API 接口

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

### 视频检测接口

```http
POST /api/detection/video
Content-Type: multipart/form-data

Response:
{
    "status": "success",
    "task_id": "abcd1234",
    "message": "视频处理已开始，请通过任务ID查询进度"
}
```

### 视频处理状态查询

```http
GET /api/detection/video/status/{task_id}

Response:
{
    "status": "processing",  // processing, completed, failed
    "progress": 45.5,        // 百分比
    "results": null,         // 完成后返回结果
    "error": null           // 失败时返回错误信息
}
```

### 历史记录查询

```http
GET /api/history
Authorization: Bearer {token}

Response:
{
    "records": [
        {
            "id": "uuid",
            "type": "image",
            "filename": "example.jpg",
            "timestamp": 1648454400000,
            "result": {...}
        }
    ]
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

    def preprocess(self, image_bytes: bytes) -> np.ndarray:
        """将字节流转换为模型输入格式"""
        # 转换为OpenCV格式
        img_array = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        # BGR转RGB（YOLO使用RGB）
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        return img_rgb

    def process_image(self, image_bytes: bytes):
        """整合预测和标注的完整流程"""
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

        # 生成标注图像
        annotated_img = results[0].plot()
        annotated_img_bgr = cv2.cvtColor(annotated_img, cv2.COLOR_RGB2BGR)

        # 编码为base64
        _, buffer = cv2.imencode('.jpg', annotated_img_bgr, [cv2.IMWRITE_JPEG_QUALITY, 95])
        base64_image = base64.b64encode(buffer).decode('utf-8')

        return {
            "status": "success",
            "results": predictions,
            "annotated_image": base64_image
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
```

## 性能优化

### 模型推理优化

-   **全局单例模式** - `detector = PestDetector()` 全局实例避免重复加载模型
-   **批处理推理** - 视频处理中使用批处理提升性能
-   **缓存机制** - 使用 Redis 缓存部分计算结果

### 视频处理优化

-   **异步任务队列** - 使用后台任务处理大型视频文件
-   **进度报告** - 实时更新处理进度
-   **资源管理** - 处理完成后自动清理临时文件

## 常见问题

### Q: 模型加载失败

安装 OpenCV 并检查模型路径：

```bash
pip install opencv-python-headless==4.11.0.86
```

确保模型文件位于正确路径:

```python
# 检查模型路径设置
print(settings.model_path)
# 应指向 model_weights/best.pt
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

### Q: 视频处理卡在进度条上怎么办？

检查 Redis 连接和后台任务进程：

```bash
# 检查Redis连接
redis-cli ping
# 应返回PONG

# 检查任务进程
ps -ef | grep celery  # 如果使用Celery
```

### Q: 批量检测时速度慢

调整批处理大小和图像尺寸：

```python
# 在settings.py中配置
IMG_SIZE = 640  # 减小尺寸提升速度
BATCH_SIZE = 8  # 增加批处理数量
```

## 部署说明

### Docker 部署

```bash
# 构建镜像
docker build -t yolopest-backend .

# 运行容器
docker run -d -p 8000:8000 \
  -v ./model_weights:/app/model_weights \
  --name yolopest-api \
  yolopest-backend
```

### 生产环境配置

关键配置参数(在`.env`中设置):

```
MODEL_PATH=./model_weights/best.pt
IMG_SIZE=640
CONF_THRESH=0.5
DB_URL=postgresql://user:password@db:5432/yolopest
REDIS_URL=redis://redis:6379/0
```

## 许可证

GPL-3.0 license
