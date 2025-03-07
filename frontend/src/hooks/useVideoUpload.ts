import { useState, useEffect, useRef } from 'react'
import { uploadVideo, getVideoResult } from '../services/api'
import axios from 'axios'

export interface VideoResult {
    time_cost: number
    results: Array<{
        timestamp: number
        predictions: Array<{
            class: string
            confidence: number
            bbox: {
                x1: number
                y1: number
                x2: number
                y2: number // 改为 y2
            }
        }>
    }>
    annotated_video: string
    video_info: {
        duration: number
        fps: number
        total_frames: number
    }
}

export interface TaskResponse {
    status: string
    task_id: string
    message: string
}

export const useVideoUpload = () => {
    const [videoResult, setVideoResult] = useState<VideoResult | null>(null)
    const [videoPreview, setVideoPreview] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [progress, setProgress] = useState<number>(0)
    const [taskId, setTaskId] = useState<string>('')
    const progressTimerRef = useRef<number | null>(null)

    useEffect(() => {
        return () => {
            if (videoPreview) {
                URL.revokeObjectURL(videoPreview)
            }
            // 清理定时器
            if (progressTimerRef.current) {
                clearInterval(progressTimerRef.current)
                progressTimerRef.current = null
            }
        }
    }, [videoPreview])

    // 修改上传部分的代码
    const handleVideoSelect = async (file: File) => {
        // 设置视频预览
        const videoURL = URL.createObjectURL(file)
        setVideoPreview(videoURL)

        // 上传并处理视频
        try {
            setLoading(true)
            setProgress(0)

            // 上传视频，获取任务ID
            const response = await uploadVideo(file)

            // 检查响应是否符合TaskResponse接口
            if ('status' in response && 'task_id' in response) {
                // 使用类型断言前先转为unknown，避免直接转换错误
                const taskResponse = response as unknown as TaskResponse

                // 如果是异步任务，保存任务ID并开始定时查询结果
                if (
                    taskResponse.status === 'processing' &&
                    taskResponse.task_id
                ) {
                    setTaskId(taskResponse.task_id)

                    // 开始轮询结果 - 仅作为WebSocket的备用方案
                    progressTimerRef.current = setInterval(async () => {
                        try {
                            const result = await getVideoResult(
                                taskResponse.task_id
                            )
                            // 如果有结果，更新状态并停止轮询
                            if (result) {
                                if (progressTimerRef.current)
                                    clearInterval(progressTimerRef.current)
                                setProgress(100)
                                setVideoResult(result)
                                setLoading(false)
                            }
                        } catch (error: unknown) {
                            if (
                                axios.isAxiosError(error) &&
                                error.response?.status === 202
                            ) {
                                // 仍在处理中，继续等待
                                console.log('视频仍在处理中...')
                            } else {
                                // 其他错误，停止轮询
                                console.error('获取视频结果失败:', error)
                                if (progressTimerRef.current)
                                    clearInterval(progressTimerRef.current)
                                setLoading(false)
                            }
                        }
                    }, 5000) // 每5秒检查一次
                } else if (
                    'results' in response &&
                    'annotated_video' in response
                ) {
                    // 如果是同步响应，直接更新结果
                    setProgress(100)
                    setVideoResult(response as unknown as VideoResult)
                    setLoading(false)
                } else {
                    console.error('服务器返回了意外的响应格式:', response)
                    alert('服务器返回了无效的响应格式')
                    setLoading(false)
                }
            } else {
                console.error('服务器返回了意外的响应格式:', response)
                alert('服务器返回了无效的响应格式')
                setLoading(false)
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                alert(`上传失败: ${error.response?.data?.detail || '未知错误'}`)
            } else {
                alert('发生未知错误')
            }
            setLoading(false)
        }
    }

    const clearResult = () => {
        setVideoResult(null)
        setVideoPreview('')
        setProgress(0)
        setTaskId('')
        // 清理定时器
        if (progressTimerRef.current) {
            clearInterval(progressTimerRef.current)
            progressTimerRef.current = null
        }
    }

    // 更新API服务以支持结果获取
    const updateResultFromWebSocket = (result: VideoResult) => {
        // 检查是否有必要字段
        if (!result || !result.annotated_video) {
            console.error('WebSocket收到的结果数据不完整', result)
            return
        }

        console.log('从WebSocket更新视频结果', result)

        // 清除轮询定时器
        if (progressTimerRef.current) {
            clearInterval(progressTimerRef.current)
            progressTimerRef.current = null
        }

        // 更新状态
        setVideoResult(result)
        setProgress(100)
        setLoading(false)
    }

    return {
        videoResult,
        videoPreview,
        loading,
        progress,
        taskId,
        handleVideoSelect,
        clearResult,
        updateResultFromWebSocket,
    }
}
