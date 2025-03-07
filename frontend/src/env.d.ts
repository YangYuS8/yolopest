/// <reference types="vite/client" />

interface ImportMetaEnv {
    // 图像处理 API
    readonly VITE_API_URL: string
    // 批量图像处理 API
    readonly VITE_API_MULTIPLE_URL: string
    // 视频处理 API
    readonly VITE_API_VIDEO_URL: string
    // 视频结果查询 API
    readonly VITE_API_VIDEO_RESULT_URL: string
    // 其他环境变量可以在此添加
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
