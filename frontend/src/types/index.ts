export interface DetectionItem {
    class: string
    confidence: number
    box: {
        x1: number
        y1: number
        x2: number
        y2: number
    }
}

export interface PestResult {
    time_cost: number
    results: DetectionItem[]
    annotated_image: string
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
    status: string
    time_cost: number
    video_length?: number
    processed_frames?: number
    fps?: number
    results: VideoDetectionFrame[] // 注意这里是results不是frames
    preview_url?: string // 可选的预览URL（标注后的视频）
    annotated_video_url?: string // 添加标注视频URL
}

// 添加以下导出
export * from './history'
