# YoloPest 组件结构说明

## 组件分类

### 通用组件 (common)

- **ActionButton** - 提供标准的操作按钮
- **LoadingDisplay** - 加载状态显示组件
- **MediaPreview** - 媒体文件预览组件

### 布局组件 (layout)

- **PageLayout** - 页面通用布局组件

### 展示组件 (display)

- **ResultDisplay** - 单个检测结果显示
- **BatchResultDisplay** - 批量检测结果显示
- **DetectionItemDisplay** - 单个检测项显示组件

### 媒体组件 (media)

- **ImageUploader** - 图片上传组件
- **VideoUploader** - 视频上传组件
- **VideoPlayer** - 视频播放组件

### 分析组件 (analysis)

- **PestDistribution** - 害虫分布统计分析
- **DetectionTrends** - 检测趋势图表
- **RegionComparison** - 区域间害虫对比分析

### 图表组件 (charts)

- **LineChart** - 趋势线图表
- **BarChart** - 分类柱状图
- **PieChart** - 占比饼图
- **HeatMap** - 热力分布图

### 历史记录组件 (history)

- **HistoryList** - 检测历史列表
- **HistoryDetail** - 历史记录详情
- **HistoryFilter** - 历史筛选控件

### 个人信息组件 (profile)

- **UserInfo** - 用户信息展示
- **AccountSettings** - 账户设置表单
- **PreferenceSettings** - 用户偏好设置

### 统计组件 (statistics)

- **StatsSummary** - 检测统计摘要
- **PestCounter** - 害虫计数器
- **AreaStats** - 区域统计信息

### 助手组件 (assistant)

- **DetectionGuide** - 检测引导助手
- **TipsCard** - 使用提示卡片
- **HelpCenter** - 帮助中心组件

## 使用示例

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

## 组件设计原则

1. **单一职责** - 每个组件只负责一个功能点
2. **可组合性** - 小组件可以组合成更复杂的组件
3. **可重用性** - 抽象通用逻辑，避免重复代码
4. **可测试性** - 组件设计便于单元测试
5. **响应式设计** - 所有组件适配多种屏幕尺寸
