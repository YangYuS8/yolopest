import { PestResult, VideoResult } from './index'

export interface HistoryRecord {
    id: string
    timestamp: number
    type: 'image' | 'batch' | 'video'
    filename: string
    thumbnail: string
    result: PestResult | VideoResult
}
