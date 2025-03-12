import React from 'react'
import { Upload, Card, Button } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'

interface VideoUploaderProps {
    onVideoSelect: (file: File) => void
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ onVideoSelect }) => {
    const uploadProps: UploadProps = {
        name: 'file',
        accept: '.mp4,.webm,.mov',
        showUploadList: true,
        beforeUpload: (file) => {
            onVideoSelect(file)
            return false // 阻止自动上传
        },
    }

    return (
        <Card title="上传视频文件">
            <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>选择视频文件</Button>
            </Upload>
            <p style={{ marginTop: 10 }}>支持格式：MP4、WebM、MOV</p>
        </Card>
    )
}

export default VideoUploader
