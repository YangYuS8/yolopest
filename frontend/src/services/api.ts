import axios from 'axios'
import { PestResult, BatchProcessResult } from '../types'
import { VideoResult } from '../hooks/useVideoUpload'

// API响应接口
interface ApiResponse<T> {
    status: string
    data: T
}

// 修改API URL，添加正确的路径前缀
const API_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:8000/api/detection/upload'

const API_MULTIPLE_URL =
    import.meta.env.VITE_API_MULTIPLE_URL ||
    'http://localhost:8000/api/detection/upload-multiple'

// 视频API路径也需要修改
const API_VIDEO_URL =
    import.meta.env.VITE_API_VIDEO_URL ||
    'http://localhost:8000/api/video/process-async'

const API_VIDEO_RESULT_URL =
    import.meta.env.VITE_API_VIDEO_RESULT_URL ||
    'http://localhost:8000/api/video/result'

// 修改返回类型
export const uploadImage = async (
    file: File
): Promise<ApiResponse<PestResult>> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })

    return response.data
}

export const uploadMultipleImages = async (
    files: File[]
): Promise<ApiResponse<BatchProcessResult>> => {
    const formData = new FormData()
    files.forEach((file) => {
        formData.append('files', file)
    })

    const response = await axios.post(API_MULTIPLE_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000, // 60秒超时
    })

    return response.data
}

export const uploadVideo = async (
    file: File
): Promise<ApiResponse<VideoResult>> => {
    const formData = new FormData()
    formData.append('file', file)

    console.log('正在上传视频，文件大小:', file.size, '类型:', file.type)

    const response = await axios.post(API_VIDEO_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000, // 5分钟超时
    })

    return response.data
}

export const getVideoResult = async (
    taskId: string
): Promise<ApiResponse<VideoResult>> => {
    const response = await axios.get(`${API_VIDEO_RESULT_URL}/${taskId}`, {
        timeout: 10000, // 10秒超时
    })

    return response.data
}
