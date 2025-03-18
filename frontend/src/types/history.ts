export interface HistoryRecord {
    id: string
    user_id?: number
    timestamp: number // JS timestamp in milliseconds
    type: string // 'image', 'video' 或其他类型
    filename: string
    thumbnail?: string
    result: {
        status: string
        predictions?: Array<{
            class: string
            confidence: number
            box: [number, number, number, number]
        }>
        time_cost?: number
        video_length?: number
        fps?: number
        processed_frames?: number
    }
}
