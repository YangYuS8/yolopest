import React, { useRef, useState } from 'react'
import { Card, Slider, Button, Space, Tabs, message } from 'antd'
import {
    PlayCircleOutlined,
    PauseCircleOutlined,
    DownloadOutlined,
} from '@ant-design/icons'
import { VideoResult } from '../../../types'
import './VideoPlayer.css'

interface VideoPlayerProps {
    videoUrl: string
    result: VideoResult | null
    onTimeUpdate: (time: number) => void
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
    videoUrl,
    result,
    onTimeUpdate,
}) => {
    const originalVideoRef = useRef<HTMLVideoElement>(null)
    const annotatedVideoRef = useRef<HTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [activeKey, setActiveKey] = useState('original')

    // 视频元数据加载完成后设置持续时间
    const handleLoadedMetadata = () => {
        if (originalVideoRef.current) {
            setDuration(originalVideoRef.current.duration)
        }
    }

    // 更新当前播放时间
    const handleTimeUpdate = () => {
        const videoRef =
            activeKey === 'original' ? originalVideoRef : annotatedVideoRef
        if (videoRef.current) {
            const time = videoRef.current.currentTime
            setCurrentTime(time)
            onTimeUpdate(time * 1000) // 转换为毫秒
        }
    }

    // 同步两个视频的播放状态
    const syncVideos = (isPlaying: boolean) => {
        if (isPlaying) {
            if (activeKey === 'original') {
                originalVideoRef.current?.play()
                if (annotatedVideoRef.current) {
                    annotatedVideoRef.current.currentTime =
                        originalVideoRef.current?.currentTime || 0
                }
            } else {
                annotatedVideoRef.current?.play()
                if (originalVideoRef.current) {
                    originalVideoRef.current.currentTime =
                        annotatedVideoRef.current?.currentTime || 0
                }
            }
        } else {
            originalVideoRef.current?.pause()
            annotatedVideoRef.current?.pause()
        }
    }

    // 控制播放/暂停
    const togglePlay = () => {
        const newPlayState = !isPlaying
        setIsPlaying(newPlayState)
        syncVideos(newPlayState)
    }

    // 设置播放进度
    const handleSliderChange = (value: number) => {
        setCurrentTime(value)

        if (originalVideoRef.current) {
            originalVideoRef.current.currentTime = value
        }
        if (annotatedVideoRef.current) {
            annotatedVideoRef.current.currentTime = value
        }

        onTimeUpdate(value * 1000) // 转换为毫秒
    }

    // 切换标签时处理
    const handleTabChange = (key: string) => {
        setActiveKey(key)
        const wasPlaying = isPlaying

        // 暂停当前播放
        setIsPlaying(false)
        originalVideoRef.current?.pause()
        annotatedVideoRef.current?.pause()

        // 同步进度
        if (
            key === 'original' &&
            annotatedVideoRef.current &&
            originalVideoRef.current
        ) {
            annotatedVideoRef.current.currentTime =
                originalVideoRef.current.currentTime
        } else if (
            key === 'annotated' &&
            originalVideoRef.current &&
            annotatedVideoRef.current
        ) {
            originalVideoRef.current.currentTime =
                annotatedVideoRef.current.currentTime
        }

        // 如果之前在播放，则继续播放
        if (wasPlaying) {
            setTimeout(() => {
                setIsPlaying(true)
                syncVideos(true)
            }, 100)
        }
    }

    // 格式化时间为 mm:ss 格式
    const formatTime = (time: number): string => {
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    // 修改renderStats函数，使其更健壮
    const renderStats = () => {
        if (!result) {
            return <p>暂无结果</p>
        }

        const totalDetections = (() => {
            try {
                // 处理数组形式的results
                if (result.results && Array.isArray(result.results)) {
                    return result.results.reduce((total, frame) => {
                        if (
                            !frame.detections ||
                            !Array.isArray(frame.detections)
                        )
                            return total
                        return total + frame.detections.length
                    }, 0)
                }

                // 处理对象形式的results（如果存在）
                if (
                    result.results &&
                    typeof result.results === 'object' &&
                    !Array.isArray(result.results)
                ) {
                    return Object.values(result.results).reduce(
                        (total, detections) => {
                            if (!Array.isArray(detections)) return total
                            return total + detections.length
                        },
                        0
                    )
                }

                return 0
            } catch (err) {
                console.error('统计检测结果时出错:', err, result)
                return 0
            }
        })()

        return (
            <div className="detection-stats">
                <p>
                    检测结果：共处理 {result.processed_frames || 0} 帧， 发现{' '}
                    {totalDetections} 个目标
                </p>
                {/* 添加更详细的状态显示 */}
                <p>状态: {result.status || '未知'}</p>
            </div>
        )
    }

    // 在renderStats函数后添加新的下载函数
    const handleDownloadVideo = () => {
        if (!result?.task_id) return

        // 构建视频下载链接 - 修改为正确路径
        const videoUrl = `${import.meta.env.VITE_API_URL || ''}/static/videos/${result.task_id}_annotated.mp4`

        // 创建一个隐藏的a标签来触发下载
        const a = document.createElement('a')
        a.href = videoUrl
        a.download = `标注视频_${result.task_id}.mp4`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

    return (
        <Card
            title="视频播放"
            className="video-player-card"
            // extra={
            //     <Space>
            //         {result?.task_id &&
            //             (result.status === 'completed' ||
            //                 result.status === 'success') && (
            //                 <Button
            //                     type="primary"
            //                     icon={<DownloadOutlined />}
            //                     onClick={handleDownloadVideo}
            //                 >
            //                     下载标注视频
            //                 </Button>
            //             )}
            //     </Space>
            // }
        >
            <Tabs
                activeKey={activeKey}
                onChange={handleTabChange}
                items={[
                    {
                        key: 'original',
                        label: '原始视频',
                        children: (
                            <div className="video-container">
                                <video
                                    ref={originalVideoRef}
                                    src={videoUrl}
                                    style={{ width: '100%' }}
                                    onLoadedMetadata={handleLoadedMetadata}
                                    onTimeUpdate={() =>
                                        activeKey === 'original' &&
                                        handleTimeUpdate()
                                    }
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                />
                            </div>
                        ),
                    },
                    {
                        key: 'annotated',
                        label: '标注视频',
                        children: (
                            <div className="video-container">
                                {result?.task_id ? (
                                    <video
                                        ref={annotatedVideoRef}
                                        style={{ width: '100%' }}
                                        onTimeUpdate={() =>
                                            activeKey === 'annotated' &&
                                            handleTimeUpdate()
                                        }
                                        onPlay={() => setIsPlaying(true)}
                                        onPause={() => setIsPlaying(false)}
                                        onError={(e) => {
                                            console.error('视频加载错误:', e)
                                            const videoElement =
                                                e.target as HTMLVideoElement
                                            console.error('视频元素状态:', {
                                                networkState:
                                                    videoElement.networkState,
                                                readyState:
                                                    videoElement.readyState,
                                                error: videoElement.error
                                                    ? {
                                                          code: videoElement
                                                              .error.code,
                                                          message:
                                                              videoElement.error
                                                                  .message,
                                                      }
                                                    : 'No error',
                                            })

                                            // 添加用户可见的错误提示
                                            message.error(
                                                '标注视频加载失败，请使用下载按钮下载后查看'
                                            )

                                            // 记录当前result对象状态以便调试
                                            console.log(
                                                '当前result对象:',
                                                result
                                            )
                                            console.log(
                                                '尝试加载的URL:',
                                                `${import.meta.env.VITE_API_URL || ''}/static/videos/${result.task_id}_annotated.mp4`
                                            )
                                        }}
                                    >
                                        {/* 提供多种格式源 */}
                                        <source
                                            src={`${import.meta.env.VITE_API_URL || ''}/static/videos/${result.task_id}_annotated.mp4`}
                                            type="video/mp4"
                                        />
                                        <source
                                            src={`${import.meta.env.VITE_API_URL || ''}/static/videos/${result.task_id}_annotated.avi`}
                                            type="video/avi"
                                        />
                                        您的浏览器不支持视频播放，请使用下载按钮下载后查看
                                    </video>
                                ) : (
                                    <div
                                        style={{
                                            padding: '20px',
                                            textAlign: 'center',
                                            backgroundColor: '#f5f5f5',
                                            height: '240px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        标注视频未生成或处理中...
                                        {result ? (
                                            <div>
                                                视频处理状态: {result.status}
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        ),
                        // 根据task_id判断是否启用，而非annotated_video_url
                        disabled:
                            !result ||
                            !result.task_id ||
                            (result.status !== 'completed' &&
                                result.status !== 'success'), // 同时接受'completed'和'success'状态
                    },
                ]}
            />

            <div className="video-controls">
                <Space
                    style={{ width: '100%' }}
                    direction="vertical"
                    size="small"
                >
                    <div className="player-controls">
                        <Button
                            type="text"
                            icon={
                                isPlaying ? (
                                    <PauseCircleOutlined />
                                ) : (
                                    <PlayCircleOutlined />
                                )
                            }
                            onClick={togglePlay}
                        />
                        <span className="time-display">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>
                    <Slider
                        min={0}
                        max={duration}
                        step={0.1}
                        value={currentTime}
                        onChange={handleSliderChange}
                        tooltip={{
                            formatter: (value) => formatTime(value || 0),
                        }}
                    />
                </Space>

                {renderStats()}
            </div>
        </Card>
    )
}

export default VideoPlayer
