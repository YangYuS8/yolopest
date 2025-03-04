# Pest Detection System

全栈病虫害检测系统，包含基于 FastAPI 的后端服务和 React 前端界面，提供图像上传与害虫识别模拟功能。

![Tech Stack](https://img.shields.io/badge/stack-FastAPI%20%2B%20React-blue)

## 技术栈

### 后端

-   FastAPI (Python 3.7+)
-   Uvicorn ASGI 服务器
-   Pydantic 数据验证
-   Docker 容器化部署

### 前端

-   React 18 (TypeScript)
-   Create React App
-   ESLint + Prettier 代码规范

## 功能特性

-   图像文件上传接口
-   害虫识别模拟功能（1 秒延迟）
-   Docker 容器化部署
-   响应式 JSON API
-   开发环境热重载
-   自动代码格式化与语法检查

## 快速开始

### 环境要求

-   Python 3.7+
-   Node.js 16+
-   npm 9+
-   Docker 20.10+

### 本地开发

#### 后端

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

访问 API 文档：http://localhost:8000/docs

#### 前端

```bash
cd frontend
npm install
npm start
```

访问应用：http://localhost:3000

### Docker 部署

```bash
docker-compose up --build
```

访问前端：http://localhost  
访问后端文档：http://localhost:8000/docs

## 项目结构

```
├── backend
│   ├── main.py            # API路由与业务逻辑
│   ├── config.py          # 配置管理
│   ├── requirements.txt   # Python依赖
│   └── .env.development   # 开发环境配置
├── frontend
│   ├── src                # 前端源码
│   ├── public             # 静态资源
│   ├── .eslintrc.js       # ESLint配置
│   ├── tsconfig.json      # TypeScript配置
│   └── .env.development   # 前端环境变量
├── docker-compose.yml     # Docker编排配置
└── .vscode
    └── settings.json      # 编辑器统一配置
```

## API 接口

### 图片上传接口

```http
POST /upload-image
Content-Type: multipart/form-data

Response:
{
    "status": "success",
    "result": {
        "pest": "褐飞虱",
        "confidence": 0.95,
        "description": "常见水稻害虫..."
    }
}
```

## 开发规范

1. **代码格式化**：

    - 保存时自动格式化（配置于 `.vscode/settings.json`）
    - Python：Black 风格（4 空格缩进）
    - TypeScript：Prettier 规范（2 空格+单引号）

2. **环境配置**：

    - 后端开发环境使用 `.env.development`
    - 生产环境通过 Docker 注入环境变量

3. **依赖管理**：
    - Python：requirements.txt 固定版本
    - Node.js：package-lock.json 锁定版本

## 常见问题

Q: 前端无法连接后端

```json
// frontend/package.json 添加代理
"proxy": "http://localhost:8000"
```

Q: Docker 部署时模型文件加载失败

```yaml
# docker-compose.yml 确保卷映射正确
volumes:
    - ./model_weights:/app/model_weights
```

Q: ESLint 错误提示

```bash
cd frontend
npm run lint:fix
```

## 许可证

GPL-3.0 license
