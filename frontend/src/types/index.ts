export interface DetectionItem {
    class: string
    confidence: number
    bbox: {
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

// 视频检测结果（新增）
export interface VideoDetectionFrame {
    timestamp: number // 视频时间戳（毫秒）
    frame_index: number // 帧索引
    detections: DetectionItem[]
    annotated_frame?: string // base64编码的标注帧
}

// 添加视频上传响应的类型
export interface VideoUploadResponse {
    status: string
    task_id: string
    message: string
}

export interface VideoResult {
    status: string
    video_length: number // 视频总长度（秒）
    processed_frames: number // 处理的帧数
    time_cost: number // 处理耗时（秒）
    fps: number // 每秒帧数
    results: VideoDetectionFrame[]
    preview_url?: string // 可选的预览URL（标注后的视频）
}
