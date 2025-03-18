# YoloPest 前端

基于 React + TypeScript + Vite 构建的智能害虫检测系统前端界面，提供图像识别、视频分析和历史记录管理等功能。

## 技术栈

- **React 18** - 组件化UI框架
- **TypeScript** - 类型安全
- **Vite** - 现代前端构建工具，提供快速的热更新
- **Ant Design** - UI组件库
- **React Router** - 客户端路由管理
- **Axios** - API请求库

## 主要功能

- ✅ 用户认证 (登录/注册)
- ✅ 图像害虫识别上传与结果展示
- ✅ 视频害虫识别分析
- ✅ 历史记录管理
- ✅ 个人信息管理

## 快速开始

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码规范检查
npm run lint
```

### 项目结构

```
src/
├── components/         # 组件
│   ├── common/         # 通用组件
│   ├── layout/         # 布局组件
│   ├── display/        # 展示组件
│   └── media/          # 媒体组件
├── pages/              # 页面组件
├── services/           # API服务
├── types/              # TypeScript类型定义
├── hooks/              # 自定义React Hooks
├── styles/             # 全局样式
└── utils/              # 工具函数
```

### 组件使用示例

```tsx
// 通过类别导入组件
import { ImageUploader } from '../components/media'
import { ResultDisplay } from '../components/display'

// 或通过主索引文件导入
import { ImageUploader, ResultDisplay } from '../components'
```

## ESLint 配置

项目使用现代化的 ESLint 配置 (ESLint v9+ Flat Config)。如需启用类型检查，请更新配置：

```js
export default tseslint.config({
    extends: [
        ...tseslint.configs.recommendedTypeChecked,
        // 或使用更严格的规则
        ...tseslint.configs.strictTypeChecked,
        // 可选的样式规则
        ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
        parserOptions: {
            project: ['./tsconfig.node.json', './tsconfig.app.json'],
            tsconfigRootDir: import.meta.dirname,
        },
    },
})
```

## 后端API连接

项目默认连接到 `http://localhost:8000` 的后端服务，可通过修改 .env 文件更改：

```
VITE_API_BASE_URL=http://your-backend-url
```

## 许可证

GPL-3.0 license
