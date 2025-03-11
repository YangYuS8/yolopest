import { useState } from 'react'
import { uploadImage } from '../services/api'
import { PestResult } from '../types'
import axios from 'axios'
import { message } from 'antd'

// 修改：定义正确的API响应类型并使用它
interface ApiResponse {
    status: string
    data: PestResult
}

export const useImageUpload = () => {
    const [previewImage, setPreviewImage] = useState<string>('')
    const [result, setResult] = useState<PestResult | null>(null)
    const [loading, setLoading] = useState<boolean>(false)

    const handleFileSelect = async (file: File) => {
        // 验证文件类型
        const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg']
        if (!validImageTypes.includes(file.type)) {
            message.error('请上传JPG或PNG格式的图片')
            return
        }

        // 验证文件大小
        if (file.size > 10 * 1024 * 1024) {
            message.error('图片大小不能超过10MB')
            return
        }

        // 设置预览图
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => setPreviewImage(reader.result as string)

        // 上传并处理结果
        try {
            setLoading(true)
            const response = (await uploadImage(file)) as ApiResponse
            // 正确处理响应结构：从response.data中提取结果
            setResult(response.data)
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const errorData = error.response?.data

                if (error.response?.status === 400) {
                    const errorMessage =
                        errorData?.message ||
                        errorData?.detail?.message ||
                        '未检测到害虫，请更换图片'
                    message.warning(errorMessage)
                } else {
                    const errorMessage =
                        errorData?.message ||
                        errorData?.detail?.message ||
                        '服务器错误，请稍后重试'
                    message.error(errorMessage)
                }
            } else {
                message.error('发生未知错误，请稍后重试')
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
