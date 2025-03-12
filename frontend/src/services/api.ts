import axios, { AxiosProgressEvent } from 'axios'
import {
    PestResult,
    BatchProcessResult,
    VideoResult,
    VideoUploadResponse,
} from '../types'
import { HistoryRecord } from '../types/history' // 添加这一行

const API_DETECTION_URL =
    import.meta.env.VITE_API_DETECTION_URL || '/api/detection/upload'
const API_BATCH_URL =
    import.meta.env.VITE_API_BATCH_URL || '/api/detection/upload-multiple'
const API_VIDEO_URL =
    import.meta.env.VITE_API_VIDEO_URL || '/api/video/process-async'

// 图片上传
export const uploadImage = async (file: File): Promise<PestResult> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await axios.post(API_DETECTION_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })

    return response.data
}

// 批量图片上传
export const uploadMultipleImages = async (
    files: File[]
): Promise<BatchProcessResult> => {
    const formData = new FormData()
    files.forEach((file) => {
        formData.append('files', file)
    })

    const response = await axios.post(API_BATCH_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000, // 60秒超时
    })

    return response.data
}

// 视频上传
export const uploadVideo = async (
    file: File,
    onProgress?: (progressEvent: AxiosProgressEvent) => void
): Promise<VideoUploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await axios.post(API_VIDEO_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000, // 5分钟超时（视频处理可能需要更长时间）
        onUploadProgress: onProgress,
    })

    return response.data
}

/**
 * 获取视频处理任务状态
 * @param taskId 任务ID
 * @returns 任务状态
 */
export const getVideoStatus = async (taskId: string) => {
    const response = await axios.get(`/api/video/status/${taskId}`)
    return response.data
}

/**
 * 获取视频处理结果
 * @param taskId 任务ID
 * @returns 视频处理结果
 */
export const getVideoResult = async (taskId: string): Promise<VideoResult> => {
    const response = await axios.get(`/api/video/result/${taskId}`)
    return response.data
}

// 添加以下历史记录相关 API

/**
 * 获取历史记录列表
 */
export const getHistoryRecords = async (params?: {
    skip?: number
    limit?: number
    type?: 'image' | 'video'
}) => {
    const { data } = await axios.get<HistoryRecord[]>('/api/history', {
        params,
    })
    return data
}

/**
 * 获取单个历史记录
 */
export const getHistoryRecord = async (id: string) => {
    const { data } = await axios.get<HistoryRecord>(`/api/history/${id}`)
    return data
}

/**
 * 创建历史记录
 */
export const createHistoryRecord = async (
    record: Omit<HistoryRecord, 'id'>
) => {
    const { data } = await axios.post<HistoryRecord>('/api/history', record)
    return data
}

/**
 * 删除历史记录
 */
export const deleteHistoryRecord = async (id: string) => {
    await axios.delete(`/api/history/${id}`)
}

/**
 * 清空所有历史记录
 */
export const clearHistoryRecords = async () => {
    await axios.delete('/api/history')
}
