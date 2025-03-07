import React from 'react'
import { Upload, Card } from 'antd'
import { InboxOutlined, VideoCameraAddOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'

const { Dragger } = Upload

interface FileUploaderProps {
    title: string
    acceptTypes: string
    multiple?: boolean
    icon: 'file' | 'video'
    description: string
    hintText: string
    onFileSelect: (file: File) => void
    onFilesSelect?: (files: File[]) => void
}

const FileUploader: React.FC<FileUploaderProps> = ({
    title,
    acceptTypes,
    multiple = false,
    icon,
    description,
    hintText,
    onFileSelect,
    onFilesSelect,
}) => {
    // 单文件上传组件的配置
    const singleUploadProps: UploadProps = {
        name: 'file',
        multiple: false,
        accept: acceptTypes,
        beforeUpload: (file) => {
            onFileSelect(file)
            return false // 阻止自动上传
        },
    }

    // 多文件上传组件的配置
    const multipleUploadProps: UploadProps = {
        name: 'file',
        multiple: true,
        accept: acceptTypes,
        fileList: [],
        beforeUpload: () => {
            return false // 阻止自动上传
        },
        onChange: (info) => {
            if (onFilesSelect) {
                const files = info.fileList.map(
                    (file) => file.originFileObj as File
                )
                onFilesSelect(files)
            }
        },
    }

    const uploadProps = multiple ? multipleUploadProps : singleUploadProps

    return (
        <Card title={title}>
            <Dragger {...uploadProps}>
                <p className="ant-upload-drag-icon">
                    {icon === 'file' ? (
                        <InboxOutlined
                            style={{ fontSize: '48px', color: '#1890ff' }}
                        />
                    ) : (
                        <VideoCameraAddOutlined
                            style={{ fontSize: '48px', color: '#1890ff' }}
                        />
                    )}
                </p>
                <p>{description}</p>
                <p>{hintText}</p>
            </Dragger>
        </Card>
    )
}

export default FileUploader
