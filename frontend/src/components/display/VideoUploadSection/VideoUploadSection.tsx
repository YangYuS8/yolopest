import React from 'react'
import { Col, Card, Progress, Alert } from 'antd'
import { VideoUploader } from '../../media'

interface VideoUploadSectionProps {
    loading: boolean
    progress: number
    onVideoSelect: (file: File) => void
}

const VideoUploadSection: React.FC<VideoUploadSectionProps> = ({
    loading,
    progress,
    onVideoSelect,
}) => {
    return (
        <Col span={24} md={12}>
            <VideoUploader onVideoSelect={onVideoSelect} />

            {loading && (
                <Card title="上传进度" style={{ marginTop: 16 }}>
                    <Progress
                        percent={progress}
                        status={progress < 100 ? 'active' : 'success'}
                        style={{ marginBottom: 16 }}
                    />
                    <Alert
                        message="视频处理可能需要较长时间，请耐心等待"
                        type="info"
                        showIcon
                    />
                </Card>
            )}
        </Col>
    )
}

export default VideoUploadSection
