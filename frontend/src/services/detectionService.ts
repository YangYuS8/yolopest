import api from '../utils/axiosConfig'
import { DetectionResult } from '../types/detection'

// 使用通用 api 实例，而不是直接使用 axios
export const detectPests = async (file: File): Promise<DetectionResult> => {
    const formData = new FormData()
    formData.append('file', file)

    try {
        // 使用正确的端点
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
