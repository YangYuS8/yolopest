import { useState } from 'react'
import { uploadVideo } from '../services/api'
import { VideoResult } from '../types'
import axios from 'axios'

export const useVideoUpload = () => {
    const [videoUrl, setVideoUrl] = useState<string>('')
    const [result, setResult] = useState<VideoResult | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [progress, setProgress] = useState<number>(0)

    const handleVideoSelect = async (file: File) => {
        // 设置视频预览
        const videoObjectUrl = URL.createObjectURL(file)
        setVideoUrl(videoObjectUrl)

        // 上传处理
        try {
            setLoading(true)
            setProgress(0)

            const data = await uploadVideo(file, (progressEvent) => {
                const percentage = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total!
                )
                setProgress(percentage)
            })

            setResult(data)
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

    return {
        videoUrl,
        result,
        loading,
        progress,
        handleVideoSelect,
    }
}
