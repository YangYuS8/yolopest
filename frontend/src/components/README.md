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

## 使用示例

```tsx
// 通过类别导入组件
import { ImageUploader } from '../components/media'
import { ResultDisplay } from '../components/display'

// 或通过主索引文件导入
import { ImageUploader, ResultDisplay } from '../components'
```
