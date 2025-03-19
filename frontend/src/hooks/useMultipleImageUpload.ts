import { useState } from 'react'
import { uploadMultipleImages } from '../services/api'
import { BatchProcessResult } from '../types'
// 删除未使用的导入
// import api from '../utils/axiosConfig'
import { v4 as uuidv4 } from 'uuid'
import { addHistoryRecord } from '../services/historyService'
import axios from 'axios' // 添加axios导入

export const useMultipleImageUpload = () => {
    const [batchResult, setBatchResult] = useState<BatchProcessResult | null>(
        null
    )
    const [loading, setLoading] = useState<boolean>(false)
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])

    const handleFilesSelect = (files: File[]) => {
        setSelectedFiles(files)
    }

    const handleUploadSuccess = async (response: BatchProcessResult) => {
        // 现有处理逻辑
        setLoading(false)

        // 为每个结果创建历史记录
        for (const result of response.results) {
            if (
                result.status === 'success' ||
                result.status === 'no_detection'
            ) {
                try {
                    // 修复类型问题 - 将bbox重命名为box以匹配类型
                    await addHistoryRecord({
                        id: uuidv4(),
                        timestamp: new Date().getTime(),
                        type: 'image',
                        filename: result.filename,
                        thumbnail:
                            result.annotated_image ||
                            `/api/static/uploads/${result.filename}`,
                        result: {
                            status: result.status,
                            predictions:
                                result.predictions?.map((p) => ({
                                    class: p.class,
                                    confidence: p.confidence,
                                    box: p.bbox || [0, 0, 0, 0], // 将bbox转为box
                                })) || [],
                        },
                    })
                } catch (error) {
                    console.error(`创建历史记录失败: ${error}`)
                }
            }
        }

        // 继续其他处理逻辑
        alert(`成功处理 ${response.processed_count} 个文件`)
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
            await handleUploadSuccess(data)
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
