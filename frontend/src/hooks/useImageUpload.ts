import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import axios, { AxiosError } from 'axios' // 导入 AxiosError 类型
import { uploadImage } from '../services/api'
import { PestResult } from '../types'
import { handleApiError } from '../services/errorHandler'
import { addHistoryRecord } from '../services/historyService'
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

            // 添加到历史记录
            addHistoryRecord({
                id: uuidv4(),
                timestamp: Date.now(),
                type: 'image',
                filename: file.name,
                thumbnail: data.annotated_image || previewImage,
                result: data,
            })
        } catch (error: unknown) {
            // 使用 unknown 替代 any，然后进行类型守卫
            handleApiError(error, '图像处理失败')
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError
                if (axiosError.response?.status === 400) {
                    showWarning('未检测到害虫，请更换图片')
                }
            }
        } finally {
            setLoading(false)
        }
    }

    return {
        previewImage,
        result,
        loading,
        handleFileSelect,
    }
}
