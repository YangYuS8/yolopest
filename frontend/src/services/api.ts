import axios, { AxiosProgressEvent } from 'axios'
import { PestResult, BatchProcessResult, VideoResult } from '../types'

// 将路径从 '/api/upload' 改为 '/api/detection/upload'
const API_URL = import.meta.env.VITE_API_URL || '/api/detection/upload'
// 批量上传路径也需要修改
const API_MULTIPLE_URL =
    import.meta.env.VITE_API_MULTIPLE_URL || '/api/detection/upload-multiple'
// 视频上传路径也需要修改
const API_VIDEO_URL =
    import.meta.env.VITE_API_VIDEO_URL || '/api/detection/upload-video'

// 图片上传
export const uploadImage = async (file: File): Promise<PestResult> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await axios.post(API_URL, formData, {
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

    const response = await axios.post(API_MULTIPLE_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000, // 60秒超时
    })

    return response.data
}

// 视频上传（新增）
export const uploadVideo = async (
    file: File,
    onProgress?: (progressEvent: AxiosProgressEvent) => void
): Promise<VideoResult> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await axios.post(API_VIDEO_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000, // 5分钟超时（视频处理可能需要更长时间）
        onUploadProgress: onProgress,
    })

    return response.data
}
