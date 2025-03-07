import React, { useRef, useState } from 'react'
import { PlayCircleOutlined } from '@ant-design/icons'

interface MediaDisplayProps {
    src: string
    type: 'image' | 'video'
    downloadLabel?: string
    onError?: () => void
}

const MediaDisplay: React.FC<MediaDisplayProps> = ({
    src,
    type,
    downloadLabel = '下载',
    onError,
}) => {
    const [error, setError] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    const handleError = () => {
        setError(true)
        if (onError) onError()
    }

    if (!src) return null

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <PlayCircleOutlined
                    style={{ fontSize: 48, color: '#ff4d4f' }}
                />
                <p>
                    媒体无法显示，请尝试下载后查看
                    {src && (
                        <a
                            href={src}
                            download={
                                type === 'video'
                                    ? 'annotated_video.mp4'
                                    : 'annotated_image.jpg'
                            }
                        >
                            {downloadLabel}
                        </a>
                    )}
                </p>
            </div>
        )
    }

    if (type === 'image') {
        return (
            <>
                <img
                    src={src}
                    alt="标注结果"
                    style={{
                        maxWidth: '100%',
                        marginBottom: '16px',
                        border: '1px solid #d9d9d9',
                    }}
                    onError={handleError}
                />
                <div style={{ marginTop: 8, textAlign: 'center' }}>
                    <a href={src} download="annotated_image.jpg">
                        {downloadLabel}
                    </a>
                </div>
            </>
        )
    }

    return (
        <>
            <video
                ref={videoRef}
                controls
                autoPlay
                onError={handleError}
                src={src}
                style={{ width: '100%' }}
            />
            <div style={{ marginTop: 8, textAlign: 'center' }}>
                <a href={src} download="annotated_video.mp4">
                    {downloadLabel}
                </a>
            </div>
        </>
    )
}

export default MediaDisplay
