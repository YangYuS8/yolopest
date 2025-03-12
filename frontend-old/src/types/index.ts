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
