// 添加或修改类型定义

export interface DetectionItem {
    class: string
    confidence: number
    bbox?: [number, number, number, number]
}

export interface PestResult {
    status: string
    result?: {
        pest: string
        confidence: number
        description?: string
    }
    annotated_image?: string
    time_cost: number
    message?: string
    error?: string
}

export interface BatchFileResult {
    filename: string
    predictions?: DetectionItem[]
    annotated_image?: string
    error?: string
}

export interface BatchProcessResult {
    status: string
    time_cost: number
    processed_count: number
    results: BatchFileResult[]
}

// 视频检测结果帧（正确定义）
export interface VideoDetectionFrame {
    timestamp: number // 视频时间戳（毫秒）
    frame_index: number // 帧索引（不是frame_number）
    detections: DetectionItem[]
    annotated_frame?: string // base64编码的标注帧
}

// 添加视频上传响应的类型
export interface VideoUploadResponse {
    status: string
    task_id: string
    message: string
}

// 视频检测完整结果
export interface VideoResult {
    task_id: string
    status: string
    video_path?: string
    annotated_video_path?: string
    results?: DetectionItem[]
    timestamp?: string
    error?: string
}

// 添加以下导出
export * from './user'
export * from './detection'
export * from './history'
