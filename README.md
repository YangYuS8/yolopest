# Pest Detection System

全栈病虫害检测系统，包含基于 FastAPI 的后端服务和 React 前端界面，提供图像上传与害虫识别模拟功能。

![Tech Stack](https://img.shields.io/badge/stack-FastAPI%20%2B%20React-blue)

## 技术栈

### 后端

-   FastAPI (Python 3.7+)
-   Uvicorn ASGI 服务器
-   Pydantic 数据验证

### 前端

-   React 18 (TypeScript)
-   Create React App
-   ESLint + Prettier 代码规范

## 功能特性

-   图像文件上传接口
-   害虫识别模拟功能（1 秒延迟）
-   响应式 JSON API
-   前端开发热重载
-   自动代码格式化与语法检查

## 快速开始

### 环境要求

-   Python 3.7+
-   Node.js 16+
-   npm 9+

### 后端运行

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

访问 API 文档：http://localhost:8000/docs

### 前端运行

```bash
cd frontend
npm install
npm start
```

访问应用：http://localhost:3000

## 项目结构

```
├── backend
│   ├── main.py            # API路由与业务逻辑
│   └── requirements.txt   # Python依赖
└── frontend
    ├── src                # 前端源码
    ├── public             # 静态资源
    ├── .eslintrc.js       # ESLint配置
    └── tsconfig.json      # TypeScript配置
```

## API 接口示例

```python
# 图片上传接口
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

1. **代码格式化**：保存时自动格式化（配置于 `.vscode/settings.json`）
2. **代码检查**：
    - Python：通过 FastAPI 内置验证
    - TypeScript：ESLint + React 规则
3. **代码风格**：
    - Python：4 空格缩进
    - TypeScript：2 空格缩进 + 单引号

## 常见问题

Q: 前端无法连接后端
A: 确保后端运行在 8000 端口，或修改前端`package.json`添加代理配置：

```json
"proxy": "http://localhost:8000"
```

Q: ESLint 错误提示
A: 运行修复命令：

```bash
cd frontend
npm run lint:fix
```

## 许可证

GPL-3.0 license
