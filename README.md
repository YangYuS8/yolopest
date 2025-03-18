# YoloPest 智能害虫检测系统

全栈病虫害检测系统，基于 YOLOv8 实现害虫检测功能，包含 FastAPI 后端服务和 React 前端界面，提供图像上传与害虫识别功能。

![Tech Stack](https://img.shields.io/badge/stack-FastAPI%20%2B%20React%20%2B%20YOLOv8-blue)

## 技术栈

### 后端

-   **FastAPI** - Python 高性能 API 框架
-   **YOLOv8** - 目标检测模型（本地定制版）
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
-   ✅ 自定义 YOLOv8 模型集成
-   ✅ 实时检测结果可视化

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

# 安装本地修改的YOLOv8
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
│   ├── ultralytics/        # 自定义修改的YOLOv8代码
│   ├── main.py             # 应用入口
│   ├── requirements.txt    # 依赖库
│   └── create_tables.py    # 数据库初始化
├── frontend
│   ├── src/                # 前端源码
│   │   ├── components/     # React组件
│   │   ├── pages/          # 页面组件
│   │   ├── services/       # API服务
│   │   └── utils/          # 工具函数
│   ├── public/             # 静态资源
│   ├── index.html          # HTML入口
│   ├── package.json        # Node.js配置
│   └── vite.config.ts      # Vite配置
└── docker-compose.yml      # Docker编排配置
```

## API 接口

### 图片检测接口

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

## 常见问题

### Q: 模型加载失败

安装 OpenCV 并检查模型路径：

```bash
pip install opencv-python-headless==4.11.0.86
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

## 许可证

GPL-3.0 license
