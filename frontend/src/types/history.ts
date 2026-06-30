<<<<<<< HEAD
import type { DetectionItem, VideoDetectionFrame } from './index'

export interface HistoryRecord {
    id: string
    user_id?: number
    timestamp: number
    type: string
=======
export interface HistoryRecord {
    id: string
    user_id?: number
    timestamp: number // JS timestamp in milliseconds
    type: string // 'image', 'video' 或其他类型
>>>>>>> origin_main
    filename: string
    thumbnail?: string
    result: {
        status: string
        predictions?: Array<{
            class: string
            confidence: number
            box: [number, number, number, number]
        }>
<<<<<<< HEAD
        detections?: DetectionItem[]
        results?: VideoDetectionFrame[]
=======
>>>>>>> origin_main
        time_cost?: number
        video_length?: number
        fps?: number
        processed_frames?: number
    }
}
