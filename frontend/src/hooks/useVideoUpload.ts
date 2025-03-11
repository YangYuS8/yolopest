import { useState, useEffect, useRef } from 'react'
import { uploadVideo, getVideoResult } from '../services/api'
import axios from 'axios'
import { message } from 'antd'

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
        // 文件类型和大小检查
        const validVideoTypes = [
            'video/mp4',
            'video/x-msvideo',
            'video/quicktime',
            'video/x-matroska',
        ]
        if (!validVideoTypes.includes(file.type)) {
            const extension = file.name.split('.').pop()?.toLowerCase()
            if (
                !(extension && ['mp4', 'avi', 'mov', 'mkv'].includes(extension))
            ) {
                message.error('请上传MP4、AVI、MOV或MKV格式的视频')
                return
            }
        }

        // 检查文件大小
        if (file.size > 100 * 1024 * 1024) {
            message.error('视频文件大小不能超过100MB')
            return
        }

        // 设置视频预览
        const videoURL = URL.createObjectURL(file)
        setVideoPreview(videoURL)

        // 上传并处理视频
        try {
            setLoading(true)
            setProgress(0)
            message.loading({
                content: '正在上传视频...',
                key: 'videoUpload',
                duration: 0,
            })

            // 上传视频，获取任务ID
            const response = await uploadVideo(file)
            message.success({
                content: '视频上传成功，正在处理...',
                key: 'videoUpload',
            })

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
                    message.info('视频处理已开始，可能需要一些时间，请耐心等待')

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
                                message.success('视频处理完成！')
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

                                // 显示更友好的错误消息
                                if (axios.isAxiosError(error)) {
                                    const errorData = error.response?.data
                                    const errorMsg =
                                        errorData?.message ||
                                        errorData?.detail?.message ||
                                        '获取视频处理结果失败'
                                    message.error(errorMsg)
                                } else {
                                    message.error(
                                        '视频处理过程中发生错误，请重试'
                                    )
                                }
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
                    message.success('视频处理完成！')
                } else {
                    console.error('服务器返回了意外的响应格式:', response)
                    message.error('服务器返回了无效的响应格式，请联系管理员')
                    setLoading(false)
                }
            } else {
                console.error('服务器返回了意外的响应格式:', response)
                message.error('服务器返回了无效的响应格式，请联系管理员')
                setLoading(false)
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const errorData = error.response?.data
                const errorMsg =
                    errorData?.message ||
                    errorData?.detail?.message ||
                    '视频上传失败'
                message.error(errorMsg)
            } else {
                message.error('视频处理过程中发生错误，请重试')
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
