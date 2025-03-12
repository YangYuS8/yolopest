import React from 'react'
import { Row, Col, Card, Button, Divider } from 'antd'
import { Link } from 'react-router-dom'
import { FileImageOutlined, VideoCameraOutlined } from '@ant-design/icons'

const Home: React.FC = () => {
    return (
        <div style={{ padding: '20px' }}>
            <Row gutter={16} justify="center">
                <Col
                    span={24}
                    style={{ textAlign: 'center', marginBottom: 40 }}
                >
                    <h1 style={{ fontSize: '2.5rem' }}>
                        YoloPest - 智能害虫检测系统
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#666' }}>
                        基于YOLOv8深度学习模型的农作物害虫智能识别平台
                    </p>
                    <Divider />
                </Col>

                <Col xs={24} sm={12} md={12} lg={8}>
                    <Card
                        hoverable
                        style={{ height: '100%' }}
                        cover={
                            <div
                                style={{
                                    height: 180,
                                    background: '#f5f5f5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <FileImageOutlined
                                    style={{ fontSize: 64, color: '#1890ff' }}
                                />
                            </div>
                        }
                        actions={[
                            <Link to="/image-detection" key="image-link">
                                <Button type="primary">开始使用</Button>
                            </Link>,
                        ]}
                    >
                        <Card.Meta
                            title="图像识别"
                            description="上传单张或批量图像进行害虫识别，支持高精度目标检测和结果标注"
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} md={12} lg={8}>
                    <Card
                        hoverable
                        style={{ height: '100%' }}
                        cover={
                            <div
                                style={{
                                    height: 180,
                                    background: '#f5f5f5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <VideoCameraOutlined
                                    style={{ fontSize: 64, color: '#52c41a' }}
                                />
                            </div>
                        }
                        actions={[
                            <Link to="/video-detection" key="video-link">
                                <Button type="primary">开始使用</Button>
                            </Link>,
                        ]}
                    >
                        <Card.Meta
                            title="视频识别"
                            description="上传视频文件进行害虫实时检测，支持逐帧分析和时间线结果展示"
                        />
                    </Card>
                </Col>
            </Row>

            <Divider style={{ margin: '40px 0' }} />

            <Row gutter={[16, 16]}>
                <Col span={24} md={8}>
                    <Card title="高效便捷">
                        <p>
                            快速上传图片或视频文件，系统自动进行害虫识别并返回结果
                        </p>
                    </Card>
                </Col>
                <Col span={24} md={8}>
                    <Card title="准确可靠">
                        <p>
                            基于先进的YOLOv8目标检测模型，准确率高，可识别多种常见农作物害虫
                        </p>
                    </Card>
                </Col>
                <Col span={24} md={8}>
                    <Card title="功能丰富">
                        <p>
                            支持单张识别、批量处理和视频分析，提供详细的检测结果和标注图像
                        </p>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default Home
