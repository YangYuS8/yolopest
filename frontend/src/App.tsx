import React, { useState } from 'react'
import { Upload, Spin, Card, Row, Col } from 'antd'
import { InboxOutlined, LoadingOutlined } from '@ant-design/icons'
import axios from 'axios'
import type { UploadProps } from 'antd'

const { Dragger } = Upload

interface DetectionItem {
    class: string
    confidence: number
    bbox: {
        x1: number
        y1: number
        x2: number
        y2: number
    }
}

interface PestResult {
    time_cost: number
    results: DetectionItem[]
}

const App: React.FC = () => {
    const [previewImage, setPreviewImage] = useState<string>('')
    const [result, setResult] = useState<PestResult | null>(null)
    const [loading, setLoading] = useState<boolean>(false)

    // 处理图片上传
    const handleUpload = async (file: File) => {
        const formData = new FormData()
        formData.append('file', file)

        try {
            setLoading(true)
            const API_URL =
                process.env.REACT_APP_API_URL ||
                'http://localhost:8000/api/upload'
            const response = await axios.post(
                API_URL, // 你的后端API地址
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            )
            setResult(response.data)
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 400) {
                    alert('未检测到害虫，请更换图片')
                } else {
                    alert('服务器错误，请重试')
                }
            }
        } finally {
            setLoading(false)
        }
    }

    // 拖拽上传组件的配置
    const uploadProps: UploadProps = {
        name: 'file',
        multiple: false,
        accept: '.png,.jpg,.jpeg',
        beforeUpload: (file) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => setPreviewImage(reader.result as string)
            handleUpload(file) // 手动触发上传
            return false // 阻止自动上传
        },
    }

    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <Row gutter={[16, 16]}>
                {/* 左侧：上传区域 */}
                <Col span={24}>
                    <Card title="上传水稻叶片图片">
                        <Dragger {...uploadProps}>
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
                </Col>

                {/* 右侧：预览与结果 */}
                <Col span={24}>
                    <Card title="识别结果">
                        {loading ? (
                            <Spin
                                indicator={
                                    <LoadingOutlined
                                        style={{ fontSize: 24 }}
                                        spin
                                    />
                                }
                            />
                        ) : (
                            <>
                                {previewImage && (
                                    <img
                                        src={previewImage}
                                        alt="预览"
                                        style={{
                                            maxWidth: '100%',
                                            marginBottom: '16px',
                                        }}
                                    />
                                )}
                                {result && (
                                    <div>
                                        <p>检测耗时: {result.time_cost}s</p>
                                        {result.results.map((item, index) => (
                                            <div
                                                key={index}
                                                style={{ marginBottom: 8 }}
                                            >
                                                <p>害虫类型: {item.class}</p>
                                                <p>
                                                    置信度:{' '}
                                                    {(
                                                        item.confidence * 100
                                                    ).toFixed(1)}
                                                    %
                                                </p>
                                                <p>
                                                    位置: X[{item.bbox.x1}-
                                                    {item.bbox.x2}] Y[
                                                    {item.bbox.y1}-
                                                    {item.bbox.y2}]
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default App
