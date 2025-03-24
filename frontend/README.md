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
- ✅ 检测结果可视化与统计分析
- ✅ 响应式界面设计

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
│   ├── media/          # 媒体组件
│   ├── analysis/       # 分析组件
│   ├── charts/         # 图表组件
│   ├── history/        # 历史记录组件
│   ├── profile/        # 个人信息组件
│   ├── statistics/     # 统计组件
│   └── assistant/      # 助手组件
├── pages/              # 页面组件
├── services/           # API服务
├── types/              # TypeScript类型定义
├── hooks/              # 自定义React Hooks
├── contexts/           # React Context
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

## 组件状态管理

组件内部状态使用React hooks管理，全局状态通过Context API共享：

```tsx
// 在组件中使用全局检测状态
import { useDetectionContext } from '../contexts/DetectionContext'

function MyComponent() {
    const { results, isProcessing, resetResults } = useDetectionContext()
    // ...
}
```

## API交互模式

组件与后端API交互统一通过services目录下的服务函数：

```tsx
// 在组件中调用API
import { detectImage } from '../services/detectionService'

async function handleUpload(file) {
    const formData = new FormData()
    formData.append('file', file)
    const result = await detectImage(formData)
    // 处理结果...
}
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

## 组件设计原则

1. **单一职责** - 每个组件只负责一个功能点
2. **可组合性** - 小组件可以组合成更复杂的组件
3. **可重用性** - 抽象通用逻辑，避免重复代码
4. **可测试性** - 组件设计便于单元测试
5. **响应式设计** - 所有组件适配多种屏幕尺寸

## 部署说明

### 开发环境部署

```bash
# 构建生产版本
npm run build

# 使用任意静态文件服务器提供服务
npx serve -s dist
```

### Docker部署

```bash
# 构建镜像
docker build -t yolopest-frontend .

# 运行容器
docker run -d -p 80:80 --name yolopest-ui yolopest-frontend
```

## 常见问题

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
