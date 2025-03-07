import React from 'react'
import FileUploader from '../common/FileUploader'

interface ImageUploaderProps {
    onFileSelect: (file: File) => void
    multiple?: boolean
    onFilesSelect?: (files: File[]) => void
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
    onFileSelect,
    multiple = false,
    onFilesSelect,
}) => {
    return (
        <FileUploader
            title={multiple ? '批量上传水稻叶片图片' : '上传水稻叶片图片'}
            acceptTypes=".png,.jpg,.jpeg"
            multiple={multiple}
            icon="file"
            description={`点击或拖拽${multiple ? '多个' : ''}图片到此区域`}
            hintText="支持格式：PNG、JPG、JPEG"
            onFileSelect={onFileSelect}
            onFilesSelect={onFilesSelect}
        />
    )
}

export default ImageUploader
