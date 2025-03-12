import { useState } from 'react'
import { uploadImage } from '../services/api'
import { PestResult } from '../types'
import axios from 'axios'

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
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 400) {
                    alert('未检测到害虫，请更换图片')
                } else {
                    alert('服务器错误，请重试')
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
