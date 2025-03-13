import React, { useRef, useState } from 'react'
import { Card, Slider, Button, Space, Tabs } from 'antd'
import { PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons'
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

    return (
        <Card title="视频播放" className="video-player-card">
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
                                {result?.annotated_video_url ? (
                                    <video
                                        ref={annotatedVideoRef}
                                        src={result.annotated_video_url}
                                        style={{ width: '100%' }}
                                        onTimeUpdate={() =>
                                            activeKey === 'annotated' &&
                                            handleTimeUpdate()
                                        }
                                        onPlay={() => setIsPlaying(true)}
                                        onPause={() => setIsPlaying(false)}
                                    />
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
                                    </div>
                                )}
                            </div>
                        ),
                        disabled: !result?.annotated_video_url,
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

                {result && (
                    <div className="detection-stats">
                        <p>
                            检测结果：共处理 {result.processed_frames} 帧，发现
                            {result.results.reduce(
                                (total, frame) =>
                                    total + frame.detections.length,
                                0
                            )}{' '}
                            个目标
                        </p>
                    </div>
                )}
            </div>
        </Card>
    )
}

export default VideoPlayer
