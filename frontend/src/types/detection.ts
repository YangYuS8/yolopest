export interface Detection {
    class: string
    confidence: number
    box: [number, number, number, number] // [x1, y1, x2, y2]
}

export interface DetectionResult {
    id: string
    timestamp: number
    filename: string
    status: string
    predictions: Detection[]
    annotated_image?: string
    time_cost: number
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
    results: Array<{
        filename: string
        status: string
        message: string
        predictions?: Detection[]
        annotated_image?: string
        error?: string
    }>
}

export interface VideoUploadResponse {
    task_id: string
    status: string
    message: string
}

export interface VideoResult {
    id: string
    task_id: string
    status: string
    filename: string
    timestamp: number
    video_length?: number
    fps?: number
    processed_frames?: number
    time_cost?: number
    results?: Record<string, Detection[]>
}
