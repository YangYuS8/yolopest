<<<<<<< HEAD
export interface DetectionBox {
    x1: number
    y1: number
    x2: number
    y2: number
}

export interface DetectionItem {
    class: string                // 主显示字段（兼容旧版，后端已返回中文）
    class_en?: string            // 英文原名（学名/数据集名）
    class_zh?: string            // 中文名（首选展示）
    class_id?: number            // 模型类别 ID
    aliases?: string[]           // 别名
    confidence: number
    pest?: string
    bbox?: DetectionBox
=======
// 添加或修改类型定义

export interface DetectionItem {
    class: string
    confidence: number
    pest?: string // 添加可选的pest属性
    bbox?: {
        x1: number
        y1: number
        x2: number
        y2: number
    }
>>>>>>> origin_main
    box?: [number, number, number, number]
}

export interface PestResult {
<<<<<<< HEAD
    status: 'success' | 'no_detection' | 'error'
    message?: string
    time_cost: number
    results: DetectionItem[]
    annotated_image?: string | null
=======
    status: string
    result?: {
        pest: string
        confidence: number
        description?: string
    }
    predictions?: DetectionItem[] // 添加此字段
    annotated_image?: string
    time_cost: number
    message?: string
>>>>>>> origin_main
    error?: string
}

export interface BatchFileResult {
    filename: string
<<<<<<< HEAD
    status: 'success' | 'error' | 'no_detection'
    message?: string
    predictions?: DetectionItem[]
    annotated_image?: string | null
    error?: string
}

export interface BatchProcessResult {
    status: string
    time_cost: number
    processed_count: number
    detection_stats: {
        detected: number
        not_detected: number
        errors: number
    }
    results: BatchFileResult[]
}

export interface VideoDetectionFrame {
    timestamp: number
    frame_index: number
    detections: DetectionItem[]
    annotated_frame?: string | null
}

=======
    predictions?: DetectionItem[]
    annotated_image?: string
    error?: string
}

// 添加或更新批处理结果类型
export interface BatchProcessResult {
    processed_count: number
    error_count?: number
    results: Array<{
        filename: string
        status: 'success' | 'error' | 'no_detection'
        message?: string
        predictions?: Array<{
            class: string
            confidence: number
            bbox?: [number, number, number, number] // 后端返回的是bbox
        }>
        annotated_image?: string
    }>
}

// 视频检测结果帧（正确定义）
export interface VideoDetectionFrame {
    timestamp: number // 视频时间戳（毫秒）
    frame_index: number // 帧索引（不是frame_number）
    detections: DetectionItem[]
    annotated_frame?: string // base64编码的标注帧
}

// 添加视频上传响应的类型
>>>>>>> origin_main
export interface VideoUploadResponse {
    status: string
    task_id: string
    message: string
}

<<<<<<< HEAD
export interface VideoResult {
    status: string
    time_cost?: number
    annotated_video_url?: string
    results: VideoDetectionFrame[]
=======
// 视频检测完整结果
export interface VideoResult {
    task_id: string
    status: string
    video_path?: string
    annotated_video_path?: string
    time_cost?: number
    annotated_video_url?: string
    results: VideoDetectionFrame[] // 修改为正确的类型
    timestamp?: string
>>>>>>> origin_main
    error?: string
    video_length?: number
    processed_frames?: number
    fps?: number
}

<<<<<<< HEAD
=======
// 添加以下导出
>>>>>>> origin_main
export * from './user'
export * from './detection'
export * from './history'
