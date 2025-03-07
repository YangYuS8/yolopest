import React from 'react'
import FileUploader from '../common/FileUploader'

interface VideoUploaderProps {
    onVideoSelect: (file: File) => void
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ onVideoSelect }) => {
    return (
        <FileUploader
            title="上传视频文件"
            acceptTypes=".mp4,.avi,.mov,.mkv"
            icon="video"
            description="点击或拖拽视频到此区域"
            hintText="支持格式：MP4、AVI、MOV、MKV（最大100MB）"
            onFileSelect={onVideoSelect}
        />
    )
}

export default VideoUploader
