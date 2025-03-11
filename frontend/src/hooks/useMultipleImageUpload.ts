import { useState } from 'react'
import { uploadMultipleImages } from '../services/api'
import axios from 'axios'
import { DetectionItem } from '../types'
import { message } from 'antd'

export interface BatchResult {
    status: string
    time_cost: number
    processed_count: number
    results: Array<{
        filename: string
        predictions?: Array<DetectionItem>
        annotated_image?: string
        error?: string
    }>
}

export const useMultipleImageUpload = () => {
    const [batchResult, setBatchResult] = useState<BatchResult | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])

    const handleFilesSelect = (files: File[]) => {
        // 验证文件类型和大小
        const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg']
        const invalidFiles = files.filter(
            (file) => !validImageTypes.includes(file.type)
        )
        const largeFiles = files.filter((file) => file.size > 10 * 1024 * 1024)

        if (invalidFiles.length > 0) {
            message.warning(
                `有${invalidFiles.length}个文件不是有效的图片格式，已自动过滤`
            )
        }

        if (largeFiles.length > 0) {
            message.warning(
                `有${largeFiles.length}个文件大小超过10MB，已自动过滤`
            )
        }

        const validFiles = files.filter(
            (file) =>
                validImageTypes.includes(file.type) &&
                file.size <= 10 * 1024 * 1024
        )

        setSelectedFiles(validFiles)

        if (validFiles.length > 0) {
            message.success(`已选择${validFiles.length}个有效图片文件`)
        } else if (files.length > 0) {
            message.error('没有有效的图片文件被选择')
        }
    }

    const uploadFiles = async () => {
        if (selectedFiles.length === 0) {
            message.warning('请先选择文件')
            return
        }

        try {
            setLoading(true)

            // 如果文件过多，提前警告用户
            if (selectedFiles.length > 20) {
                message.warning('一次最多处理20张图片，将只处理前20张')
            }

            // 限制上传文件数量
            const filesToUpload = selectedFiles.slice(0, 20)

            const response = await uploadMultipleImages(filesToUpload)
            setBatchResult(response.data)

            // 检查是否有处理失败的图片
            const failedCount = response.data.results.filter(
                (item) => item.error
            ).length
            if (failedCount > 0) {
                message.warning(
                    `成功处理了${
                        response.data.processed_count - failedCount
                    }个文件，${failedCount}个文件处理失败`
                )
            } else {
                message.success(
                    `成功处理了${response.data.processed_count}个图片文件`
                )
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const errorData = error.response?.data
                const errorMsg =
                    errorData?.message ||
                    errorData?.detail?.message ||
                    '批量上传失败，请稍后重试'
                message.error(errorMsg)
            } else {
                message.error('发生未知错误，请稍后重试')
            }
        } finally {
            setLoading(false)
        }
    }

    const clearResults = () => {
        setBatchResult(null)
        setSelectedFiles([])
        message.info('已清空批量处理结果')
    }

    return {
        batchResult,
        loading,
        selectedFiles,
        handleFilesSelect,
        uploadFiles,
        clearResults,
    }
}
