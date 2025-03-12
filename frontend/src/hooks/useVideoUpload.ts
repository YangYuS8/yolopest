import { useState } from 'react'
import { uploadVideo, getVideoStatus, getVideoResult } from '../services/api'
import { VideoResult } from '../types'

export const useVideoUpload = () => {
    const [videoUrl, setVideoUrl] = useState<string>('')
    const [result, setResult] = useState<VideoResult | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [progress, setProgress] = useState<number>(0)
    const [taskId, setTaskId] = useState<string | null>(null)
    const [taskStatus, setTaskStatus] = useState<string>('')

    const handleVideoSelect = async (file: File) => {
        if (!file) return

        try {
            setLoading(true)
            setProgress(0)

            // 创建本地URL用于预览
            const objectUrl = URL.createObjectURL(file)
            setVideoUrl(objectUrl)

            // 上传文件到服务器 - 不需要类型断言
            const uploadResponse = await uploadVideo(file)
            const id = uploadResponse.task_id
            setTaskId(id)

            // 开始轮询检查视频处理状态
            const intervalId = setInterval(async () => {
                const statusResponse = await getVideoStatus(id)
                setTaskStatus(statusResponse.status)

                // 更新进度
                if (statusResponse.progress !== undefined) {
                    setProgress(statusResponse.progress)
                }

                // 如果处理完成或失败，获取结果
                if (statusResponse.status === 'completed') {
                    clearInterval(intervalId)
                    const resultResponse = await getVideoResult(id)
                    setResult(resultResponse)
                    setLoading(false)
                } else if (statusResponse.status === 'failed') {
                    clearInterval(intervalId)
                    console.error('视频处理失败:', statusResponse.error)
                    setLoading(false)
                }
            }, 2000) // 每2秒检查一次状态
        } catch (error) {
            console.error('上传视频出错:', error)
            setLoading(false)
        }
    }

    // 清除结果的函数
    const clearResults = () => {
        setResult(null)
        setVideoUrl('')
        setTaskId(null)
        setTaskStatus('')
        setProgress(0)
    }

    return {
        videoUrl,
        result,
        loading,
        progress,
        handleVideoSelect,
        taskId,
        taskStatus,
        clearResults,
    }
}
