import React, { useRef, useState } from 'react'
import { Card, Slider, Button, Space } from 'antd'
import { PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons'
import { VideoResult } from '../../types'
import './VideoPlayer.css'

interface VideoPlayerProps {
    videoUrl: string
    result?: VideoResult | null
    onTimeUpdate?: (currentTime: number) => void
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
    videoUrl,
    result,
    onTimeUpdate,
}) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)

    // 视频元数据加载完成后设置持续时间
    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration)
        }
    }

    // 更新当前播放时间
    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const time = videoRef.current.currentTime
            setCurrentTime(time)
            if (onTimeUpdate) {
                onTimeUpdate(time)
            }
        }
    }

    // 控制播放/暂停
    const togglePlay = () => {
        if (!videoRef.current) return

        if (isPlaying) {
            videoRef.current.pause()
        } else {
            videoRef.current.play()
        }
        setIsPlaying(!isPlaying)
    }

    // 设置播放进度
    const handleSliderChange = (value: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = value
            setCurrentTime(value)
            if (onTimeUpdate) {
                onTimeUpdate(value)
            }
        }
    }

    // 格式化时间为 mm:ss 格式
    const formatTime = (time: number): string => {
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    // 监听视频播放结束事件
    const handleEnded = () => {
        setIsPlaying(false)
    }

    return (
        <Card title="视频播放器" className="video-player-card">
            <div className="video-container">
                <video
                    ref={videoRef}
                    src={videoUrl}
                    onLoadedMetadata={handleLoadedMetadata}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleEnded}
                    className="video-element"
                />
            </div>

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
