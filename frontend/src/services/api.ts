import axios from 'axios'
import { PestResult, BatchProcessResult } from '../types'

// 获取API URL
const API_URL =
    process.env.REACT_APP_API_URL || 'http://localhost:8000/api/upload'

const API_MULTIPLE_URL =
    process.env.REACT_APP_API_MULTIPLE_URL ||
    'http://localhost:8000/api/upload-multiple'

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
