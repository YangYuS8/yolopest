import { useState } from 'react'
import { uploadMultipleImages } from '../services/api'
import axios from 'axios'

export interface BatchResult {
    status: string
    time_cost: number
    processed_count: number
    results: Array<{
        filename: string
        predictions?: Array<any>
        annotated_image?: string
        error?: string
    }>
}

export const useMultipleImageUpload = () => {
    const [batchResult, setBatchResult] = useState<BatchResult | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])

    const handleFilesSelect = (files: File[]) => {
        setSelectedFiles(files)
    }

    const uploadFiles = async () => {
        if (selectedFiles.length === 0) {
            alert('请先选择文件')
            return
        }

        try {
            setLoading(true)
            const data = await uploadMultipleImages(selectedFiles)
            setBatchResult(data)
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                alert(`上传失败: ${error.response?.data?.detail || '未知错误'}`)
            } else {
                alert('发生未知错误')
            }
        } finally {
            setLoading(false)
        }
    }

    const clearResults = () => {
        setBatchResult(null)
        setSelectedFiles([])
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
