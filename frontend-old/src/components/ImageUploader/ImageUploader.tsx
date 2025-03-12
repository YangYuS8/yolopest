import React from 'react'
import { Upload, Card } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'

const { Dragger } = Upload

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
    // 单文件上传组件的配置
    const singleUploadProps: UploadProps = {
        name: 'file',
        multiple: false,
        accept: '.png,.jpg,.jpeg',
        beforeUpload: (file) => {
            onFileSelect(file)
            return false // 阻止自动上传
        },
    }

    // 多文件上传组件的配置
    const multipleUploadProps: UploadProps = {
        name: 'file',
        multiple: true,
        accept: '.png,.jpg,.jpeg',
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

    if (!multiple) {
        return (
            <Card title="上传水稻叶片图片">
                <Dragger {...singleUploadProps}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined
                            style={{
                                fontSize: '48px',
                                color: '#1890ff',
                            }}
                        />
                    </p>
                    <p>点击或拖拽图片到此区域</p>
                    <p>支持格式：PNG、JPG、JPEG</p>
                </Dragger>
            </Card>
        )
    } else {
        return (
            <Card title="批量上传水稻叶片图片">
                <Dragger {...multipleUploadProps}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined
                            style={{
                                fontSize: '48px',
                                color: '#1890ff',
                            }}
                        />
                    </p>
                    <p>点击或拖拽多个图片到此区域</p>
                    <p>支持格式：PNG、JPG、JPEG</p>
                </Dragger>
            </Card>
        )
    }
}

export default ImageUploader
