import axios, { AxiosProgressEvent } from 'axios'
import { VideoResult, VideoUploadResponse } from '../types'
import { HistoryRecord } from '../types/history' // 添加这一行

// 获取API基础URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// 创建axios实例
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// 请求拦截器
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

export default api

// 图片检测API
export const uploadImage = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
        // 注意：api 实例已经带有 baseURL，所以这里只需要路径部分
        const response = await api.post('/detection/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    } catch (error) {
        console.error('上传图片失败:', error)
        throw error
    }
}

// 批量图片检测API
export const uploadMultipleImages = async (files: File[]) => {
    const formData = new FormData()
    files.forEach((file) => {
        formData.append('files', file)
    })

    try {
        const response = await api.post(
            '/detection/upload-multiple',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        )
        return response.data
    } catch (error) {
        console.error('批量上传图片失败:', error)
        throw error
    }
}

// 修改视频上传方法
export const uploadVideo = async (
    file: File,
    onProgress?: (progressEvent: AxiosProgressEvent) => void
): Promise<VideoUploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/video/process-async', formData, {
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
    const response = await api.get(`/video/status/${taskId}`)
    return response.data
}

/**
 * 获取视频处理结果
 * @param taskId 任务ID
 * @returns 视频处理结果
 */
export const getVideoResult = async (taskId: string): Promise<VideoResult> => {
    const response = await api.get(`/video/result/${taskId}`)
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
    const { data } = await api.get<HistoryRecord[]>('/history', {
        params,
    })
    return data
}

/**
 * 获取单个历史记录
 */
export const getHistoryRecord = async (id: string) => {
    const { data } = await api.get<HistoryRecord>(`/history/${id}`)
    return data
}

/**
 * 创建历史记录
 */
export const createHistoryRecord = async (
    record: Omit<HistoryRecord, 'id'>
) => {
    const { data } = await api.post<HistoryRecord>('/history', record)
    return data
}

/**
 * 删除历史记录
 */
export const deleteHistoryRecord = async (id: string) => {
    await api.delete(`/history/${id}`)
}

/**
 * 清空所有历史记录
 */
export const clearHistoryRecords = async () => {
    await api.delete('/history')
}
