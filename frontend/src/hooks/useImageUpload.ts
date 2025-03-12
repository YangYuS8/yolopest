import { useState } from 'react'
import axios from 'axios' // 添加这一行
import { uploadImage } from '../services/api'
import { PestResult } from '../types'
import { handleApiError } from '../services/errorHandler'
import { showWarning } from '../services/notificationService'

export const useImageUpload = () => {
    const [previewImage, setPreviewImage] = useState<string>('')
    const [result, setResult] = useState<PestResult | null>(null)
    const [loading, setLoading] = useState<boolean>(false)

    const handleFileSelect = async (file: File) => {
        // 设置预览图
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => setPreviewImage(reader.result as string)

        // 上传并处理结果
        try {
            setLoading(true)
            const data = await uploadImage(file)
            setResult(data)
        } catch (error: unknown) {
            // 更优雅的错误处理
            handleApiError(error, '图像处理失败')
            if (axios.isAxiosError(error) && error.response?.status === 400) {
                showWarning('未检测到害虫，请更换图片')
            }
        } finally {
            setLoading(false)
        }
    }

    return { previewImage, result, loading, handleFileSelect }
}
