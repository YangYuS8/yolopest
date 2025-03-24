# YoloPest 智能害虫检测系统

全栈病虫害检测系统，基于 YOLOv12 实现害虫检测功能，包含 FastAPI 后端服务和 React 前端界面，提供图像上传与害虫识别功能。

![Tech Stack](https://img.shields.io/badge/stack-FastAPI%20%2B%20React%20%2B%20YOLOv12-blue)

## 技术栈

### 后端

-   **FastAPI** - Python 高性能 API 框架
-   **YOLOv12** - 目标检测模型（本地定制版）
-   **SQLAlchemy** - ORM 数据库映射
-   **Redis** - 缓存与会话管理
-   **Uvicorn** - ASGI 服务器
-   **Pydantic** - 数据验证
-   **OpenCV** - 图像处理
-   **Docker** - 容器化部署

### 前端

-   **React 18** - 组件化 UI 框架
-   **TypeScript** - 类型安全
-   **Vite** - 现代前端构建工具
-   **Ant Design** - UI 组件库
-   **React Router** - 客户端路由
-   **Axios** - API 请求库

## 功能特性

-   ✅ 用户认证 (登录/注册)
-   ✅ 图像害虫识别上传与结果展示
-   ✅ 视频害虫识别分析
-   ✅ 历史记录管理
-   ✅ 个人信息管理
-   ✅ 自定义 YOLOv12 模型集成
-   ✅ 实时检测结果可视化
-   ✅ 检测结果统计分析
-   ✅ 响应式界面设计

## 系统架构

### 核心组件

-   **前端应用** - React 单页应用，处理用户交互与结果展示
-   **后端 API 服务** - FastAPI 提供 RESTful 接口
-   **检测引擎** - 封装 YOLOv12 模型的图像识别服务
-   **数据管理** - 用户和检测历史的存储与检索
-   **任务队列** - 处理视频等长时间任务

### 数据流程

1. 用户上传图像/视频 → 前端预处理
2. API 请求 → 后端服务器
3. 后端处理 → 模型推理
4. 结果返回 → 前端展示
5. 数据存储 → 历史记录

## 快速开始

### 环境要求

-   Python 3.8+
-   Node.js 18+
-   npm 9+
-   Redis 7+
-   Docker 20.10+ (可选)

### 本地开发

#### 后端

```bash
cd backend

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

#### 前端

```bash
cd frontend
npm install
npm run dev
```

访问应用：http://localhost:5173

### Docker 部署

```bash
docker-compose up --build
```

访问前端：http://localhost  
访问后端文档：http://localhost:8000/docs

## 项目结构

```
├── backend
│   ├── app/                # 应用核心代码
│   │   ├── api/            # API路由和处理函数
│   │   ├── core/           # 配置和基础设施
│   │   ├── models/         # 数据库模型
│   │   ├── schemas/        # Pydantic模型
│   │   ├── services/       # 业务逻辑
│   │   └── static/         # 静态资源
│   ├── ultralytics/        # 自定义修改的YOLOv12代码
│   ├── main.py             # 应用入口
│   ├── requirements.txt    # 依赖库
│   └── create_tables.py    # 数据库初始化
├── frontend
│   ├── src/                # 前端源码
│   │   ├── components/     # React组件
│   │   │   ├── common/     # 通用组件
│   │   │   ├── layout/     # 布局组件
│   │   │   ├── display/    # 展示组件
│   │   │   ├── media/      # 媒体组件
│   │   │   ├── analysis/   # 分析组件
│   │   │   ├── charts/     # 图表组件
│   │   │   ├── history/    # 历史记录组件
│   │   │   ├── profile/    # 个人信息组件
│   │   │   ├── statistics/ # 统计组件
│   │   │   └── assistant/  # 助手组件
│   │   ├── pages/          # 页面组件
│   │   ├── services/       # API服务
│   │   ├── hooks/          # 自定义Hooks
│   │   ├── contexts/       # React Context
│   │   ├── styles/         # 全局样式
│   │   ├── types/          # TypeScript类型定义
│   │   └── utils/          # 工具函数
│   ├── public/             # 静态资源
│   ├── index.html          # HTML入口
│   ├── package.json        # Node.js配置
│   └── vite.config.ts      # Vite配置
└── docker-compose.yml      # Docker编排配置
```

## 前端组件结构

### 主要组件分类

-   **媒体组件** - 负责处理图像和视频上传、预览和播放
-   **展示组件** - 呈现检测结果和标注图像
-   **分析组件** - 提供数据可视化和统计分析功能
-   **历史组件** - 管理和展示历史检测记录

### 组件状态管理

```tsx
// 在组件中使用全局检测状态
import { useDetectionContext } from '../contexts/DetectionContext'

function MyComponent() {
    const { results, isProcessing, resetResults } = useDetectionContext()
    // ...
}
```

## API 接口

### 图片检测接口

```http
POST /api/detection/image
Content-Type: multipart/form-data

Request:
- file: 图像文件(jpg, png, jpeg)

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

Request:
- file: 视频文件(mp4, avi)

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

后端通过 PestDetector 类实现模型集成：

```python
class PestDetector:
    def __init__(self):
        self.model = YOLO(settings.model_path, task="detect")
        self.img_size = settings.img_size
        self.conf_thresh = settings.conf_thresh

    def process_image(self, image_bytes: bytes):
        # 预处理图像
        img_rgb = self.preprocess(image_bytes)

        # 模型推理
        results = self.model(img_rgb, imgsz=self.img_size, conf=self.conf_thresh)

        # 解析结果并返回
        predictions = self.parse_results(results)
        return {
            "status": "success",
            "results": predictions,
            "annotated_image": "..."  # base64编码图像
        }
```

## 性能优化

### 后端优化

-   **全局单例模型** - 避免重复加载模型
-   **批处理推理** - 视频处理中使用批处理提升性能
-   **缓存机制** - 使用 Redis 缓存部分计算结果
-   **异步任务处理** - 长时间运行的任务使用后台队列

### 前端优化

-   **懒加载组件** - 按需加载页面组件
-   **图像压缩** - 上传前压缩大图像
-   **结果缓存** - 缓存检测结果避免重复请求
-   **虚拟列表** - 历史记录中使用虚拟滚动

## 开发规范

1. **代码格式化**：

    - 后端：Black 格式化工具（4 空格缩进）
    - 前端：ESLint + Prettier（2 空格+单引号）

2. **环境配置**：

    - 开发环境：`.env.development`
    - 生产环境：Docker 环境变量或`.env.production`

3. **依赖管理**：

    - Python：固定版本在 requirements.txt
    - Node.js：package-lock.json 锁定版本

4. **组件设计原则**：
    - 单一职责 - 每个组件只负责一个功能点
    - 可组合性 - 小组件可以组合成更复杂的组件
    - 可重用性 - 抽象通用逻辑，避免重复代码
    - 可测试性 - 组件设计便于单元测试
    - 响应式设计 - 所有组件适配多种屏幕尺寸

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

### Q: 前端代理配置

修改 Vite 配置以连接后端：

```js
// vite.config.ts
export default defineConfig({
    // ...
    server: {
        proxy: {
            '/api': 'http://localhost:8000',
        },
    },
})
```

### Q: Docker 部署时模型路径问题

确保正确映射卷：

```yaml
# docker-compose.yml
volumes:
    - ./backend/models:/app/models
```

### Q: 图像上传后无法显示检测结果

检查后端连接配置：

```js
// 检查.env文件中的API地址配置
console.log(import.meta.env.VITE_API_BASE_URL)
```

### Q: 如何处理检测结果中的坐标问题

前端与后端坐标系统可能不一致，请确保转换：

```tsx
// 将后端返回的bbox转换为前端可用格式
const box = result.bbox
    ? [result.bbox.x1, result.bbox.y1, result.bbox.x2, result.bbox.y2]
    : result.box
```

### Q: 视频处理进度无法更新

确保正确设置了轮询间隔：

```tsx
// 建议使用自定义Hook管理视频处理进度
useEffect(() => {
    const interval = setInterval(checkProgress, 2000) // 每2秒检查一次
    return () => clearInterval(interval)
}, [taskId])
```

## 许可证

GPL-3.0 license
