import React, { useRef, useState, useEffect } from 'react'
import { Card, Empty, List, Button } from 'antd'
import { VideoResult } from '../../hooks/useVideoUpload'
import LoadingIndicator from '../common/LoadingIndicator'
import ProgressIndicator from '../common/ProgressIndicator'
import MediaDisplay from '../common/MediaDisplay'
import PestPredictionItem from '../common/PestPredictionItem'

// 定义中间结果的接口
interface InterimResult {
    timestamp: number
    predictions: Array<{
        class: string
        confidence: number
        bbox: {
            x1: number
            y1: number
            x2: number
            y2: number
        }
    }>
}

interface VideoResultDisplayProps {
    loading: boolean
    progress: number
    videoPreview: string
    videoResult: VideoResult | null
    onClear: () => void
    taskId?: string
    onWebSocketResult?: (result: VideoResult) => void
}

const VideoResultDisplay: React.FC<VideoResultDisplayProps> = ({
    loading,
    progress,
    videoPreview,
    videoResult,
    onClear,
    taskId,
    onWebSocketResult,
}) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [videoError, setVideoError] = useState<boolean>(false)
    const [blobUrl, setBlobUrl] = useState<string>('')
    const [wsProgress, setWsProgress] = useState<number>(0)
    const [interimResults, setInterimResults] = useState<InterimResult[]>([])
    const wsRef = useRef<WebSocket | null>(null)

    // WebSocket连接管理
    useEffect(() => {
        // 只有在有任务ID且正在加载时才连接WebSocket
        if (taskId && loading) {
            const protocol =
                window.location.protocol === 'https:' ? 'wss:' : 'ws:'
            const wsUrl = `${protocol}//${window.location.host}/api/ws/video/${taskId}`
            const ws = new WebSocket(wsUrl)

            ws.onopen = () => {
                console.log('WebSocket连接已建立')
            }

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)
                    console.log('收到WebSocket消息:', data)

                    // 更新进度
                    if (data.progress !== undefined) {
                        setWsProgress(data.progress)
                    }

                    // 如果有中间结果，更新显示
                    if (
                        data.interim_results &&
                        data.interim_results.length > 0
                    ) {
                        setInterimResults((prev) => [
                            ...prev,
                            ...data.interim_results,
                        ])
                    }

                    // 如果处理完成，更新视频结果
                    if (data.status === 'completed' && data.result) {
                        // 通知父组件更新结果
                        if (onWebSocketResult) {
                            onWebSocketResult(data.result)
                        }
                    }
                } catch (error) {
                    console.error('解析WebSocket消息失败:', error)
                }
            }

            ws.onerror = (error) => {
                console.error('WebSocket错误:', error)
            }

            ws.onclose = () => {
                console.log('WebSocket连接已关闭')
            }

            wsRef.current = ws

            // 组件卸载时关闭WebSocket连接
            return () => {
                if (
                    ws.readyState === WebSocket.OPEN ||
                    ws.readyState === WebSocket.CONNECTING
                ) {
                    ws.close()
                }
            }
        }
    }, [taskId, loading, onWebSocketResult]) // 添加onWebSocketResult作为依赖项

    // base64 转 Blob URL 处理
    useEffect(() => {
        // 清理之前的URL
        if (blobUrl) {
            URL.revokeObjectURL(blobUrl)
            setBlobUrl('')
        }

        if (videoResult?.annotated_video) {
            try {
                // 检查是否已经是Blob URL（避免重复处理）
                if (videoResult.annotated_video.startsWith('blob:')) {
                    setBlobUrl(videoResult.annotated_video)
                    return
                }

                // 确保数据是base64格式
                const dataUrlRegex = /^data:(.*?);base64,(.*)$/
                const matches = videoResult.annotated_video.match(dataUrlRegex)

                if (!matches || matches.length !== 3) {
                    console.error('无效的数据URL格式')
                    setVideoError(true)
                    return
                }

                const mimeType = matches[1] // 从data URI提取MIME类型
                const base64Data = matches[2] // 提取base64数据

                // 使用更高效的方式处理大型base64
                const byteString = atob(base64Data)
                const ab = new ArrayBuffer(byteString.length)
                const ia = new Uint8Array(ab)

                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i)
                }

                const blob = new Blob([ab], { type: mimeType })
                const url = URL.createObjectURL(blob)

                setBlobUrl(url)
                setVideoError(false)
            } catch (error) {
                console.error('创建Blob URL失败:', error)
                setVideoError(true)
            }
        }

        // 组件卸载时清理
        return () => {
            if (blobUrl) {
                URL.revokeObjectURL(blobUrl)
            }
        }
    }, [videoResult?.annotated_video, blobUrl]) // 添加blobUrl作为依赖项

    // 添加时间跳转处理函数
    const handleTimeJump = (timestamp: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = timestamp
            videoRef.current.play()
        }
    }

    // 在loading部分显示WebSocket更新的进度
    if (loading) {
        return (
            <Card title="视频处理结果">
                <LoadingIndicator message="正在处理视频..." />
                <ProgressIndicator
                    percent={wsProgress > 0 ? wsProgress : progress}
                />

                {/* 显示中间检测结果 */}
                {interimResults.length > 0 && (
                    <div style={{ marginTop: 16, textAlign: 'left' }}>
                        <h4>已检测到 {interimResults.length} 个结果</h4>
                        <List
                            size="small"
                            dataSource={interimResults.slice(0, 5)} // 只显示最近5个
                            renderItem={(item) => (
                                <List.Item>
                                    时间点: {item.timestamp.toFixed(2)}秒，
                                    检测到 {item.predictions.length} 个害虫
                                </List.Item>
                            )}
                        />
                        {interimResults.length > 5 && (
                            <p>...还有更多结果正在处理中</p>
                        )}
                    </div>
                )}
            </Card>
        )
    }

    // 当视频上传但还未处理完成时，显示原始视频预览
    if (!videoResult && videoPreview) {
        return (
            <Card title="视频预览">
                <div style={{ marginBottom: 16 }}>
                    <MediaDisplay src={videoPreview} type="video" />
                    <p style={{ textAlign: 'center', marginTop: 8 }}>
                        <i>正在等待处理完成...</i>
                    </p>
                </div>
            </Card>
        )
    }

    if (!videoResult) {
        return (
            <Card title="视频处理结果">
                <Empty description="尚未上传视频或处理结果为空" />
            </Card>
        )
    }

    return (
        <Card
            title={`视频处理结果 (处理耗时${videoResult.time_cost}秒)`}
            extra={<a onClick={onClear}>清空</a>}
        >
            <div style={{ marginBottom: 16 }}>
                <h3>视频信息</h3>
                <p>时长: {videoResult.video_info.duration.toFixed(2)}秒</p>
                <p>帧率: {videoResult.video_info.fps.toFixed(2)} FPS</p>
                <p>总帧数: {videoResult.video_info.total_frames}</p>
            </div>

            <div style={{ marginBottom: 16 }}>
                <h3>处理后视频</h3>
                {videoError ? (
                    <div style={{ color: 'red', marginBottom: '10px' }}>
                        视频加载错误，请尝试重新上传
                    </div>
                ) : null}
                <MediaDisplay
                    src={blobUrl || videoResult?.annotated_video}
                    type="video"
                    downloadLabel="下载视频"
                    onError={() => setVideoError(true)}
                />
            </div>

            <div>
                <h3>检测结果 ({videoResult.results.length}个时间点)</h3>
                {videoResult.results.length > 0 ? (
                    <List
                        dataSource={videoResult.results}
                        renderItem={(result) => (
                            <List.Item>
                                <Card
                                    title={
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <span>
                                                时间点:{' '}
                                                {result.timestamp.toFixed(2)}秒
                                            </span>
                                            <Button
                                                type="primary"
                                                size="small"
                                                onClick={() =>
                                                    handleTimeJump(
                                                        result.timestamp
                                                    )
                                                }
                                            >
                                                跳转至此时间点
                                            </Button>
                                        </div>
                                    }
                                    type="inner"
                                    style={{ width: '100%' }}
                                >
                                    {result.predictions.map((pred, pidx) => (
                                        <PestPredictionItem
                                            key={pidx}
                                            className={pred.class}
                                            confidence={pred.confidence}
                                            bbox={pred.bbox}
                                        />
                                    ))}
                                </Card>
                            </List.Item>
                        )}
                    />
                ) : (
                    <Empty description="未检测到害虫" />
                )}
            </div>
        </Card>
    )
}

export default VideoResultDisplay
