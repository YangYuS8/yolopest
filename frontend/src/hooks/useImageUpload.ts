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

            // 添加到历史记录，注意不包含时区信息的时间戳
            // 修改这部分代码以符合类型定义
            await addHistoryRecord({
                id: uuidv4(),
                timestamp: Date.now(), // 使用数字时间戳
                type: 'image',
                filename: file.name,
                thumbnail: data.annotated_image || previewImage,
                // 精简结果，确保与类型定义匹配 - 避免使用 PestResult 中不存在的属性
                result: {
                    status: 'success', // 假设这是需要的属性
                    time_cost: data.time_cost,
                    // 修改这里，将results映射为predictions
                    // 添加类型注解，解决隐式any问题
                    predictions: data.results.map(
                        (item: {
                            class: string
                            confidence: number
                            bbox?: [number, number, number, number]
                        }) => ({
                            class: item.class,
                            confidence: item.confidence,
                            box: item.bbox || [0, 0, 0, 0], // 使用box而不是bbox
                        })
                    ),
                    // 移除非法属性 annotated_image
                },
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
