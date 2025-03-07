import axios from 'axios'
import { PestResult, BatchProcessResult } from '../types'
import { VideoResult } from '../hooks/useVideoUpload'

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

export const uploadImage = async (file: File): Promise<PestResult> => {
    const formData = new FormData()
    formData.append('file', file) // 修改这里: 'files' -> 'file'

    const response = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })

    return response.data
}

export const uploadMultipleImages = async (
    files: File[]
): Promise<BatchProcessResult> => {
    const formData = new FormData()
    files.forEach((file) => {
        formData.append('files', file) // 这里使用'files'是正确的，因为后端期望是List[UploadFile]
    })

    const response = await axios.post(API_MULTIPLE_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000, // 60秒超时
    })

    return response.data
}

export const uploadVideo = async (file: File): Promise<VideoResult> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await axios.post(API_VIDEO_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000, // 5分钟超时
    })

    return response.data
}

// 添加获取视频结果的方法
export const getVideoResult = async (taskId: string): Promise<VideoResult> => {
    const response = await axios.get(`${API_VIDEO_RESULT_URL}/${taskId}`, {
        timeout: 10000, // 10秒超时
    })

    return response.data
}
