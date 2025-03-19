import React from 'react'
import { Row, Col, Divider, Typography, Card, Space } from 'antd'
import {
    FileImageOutlined,
    VideoCameraOutlined,
    RocketOutlined,
    SafetyCertificateOutlined,
    AppstoreOutlined,
} from '@ant-design/icons'
import MediaCard from '../components/common/MediaCard/MediaCard'

const { Title, Paragraph } = Typography

const Home: React.FC = () => {
    return (
        <div className="home-container">
            <Row gutter={[0, 48]}>
                {/* 头部区域 */}
                <Col span={24} className="text-center">
                    <Space direction="vertical" size="large">
                        <Title level={1}>YoloPest - 智能害虫检测系统</Title>
                        <Paragraph
                            type="secondary"
                            style={{ fontSize: '18px' }}
                        >
                            基于YOLOv8深度学习模型的农作物害虫智能识别平台
                        </Paragraph>
                    </Space>
                    <Divider />
                </Col>

                {/* 功能卡片区域 */}
                <Col span={24}>
                    <Row gutter={[24, 24]} justify="center">
                        <Col xs={24} sm={12} md={12} lg={8}>
                            <MediaCard
                                title="图像识别"
                                icon={<FileImageOutlined />}
                                description="上传单张或批量图像进行害虫识别，支持高精度目标检测和结果标注"
                                actionPath="/image-detection"
                                iconColor="#1890ff"
                            />
                        </Col>

                        <Col xs={24} sm={12} md={12} lg={8}>
                            <MediaCard
                                title="视频识别"
                                icon={<VideoCameraOutlined />}
                                description="上传视频文件进行害虫实时检测，支持逐帧分析和时间线结果展示"
                                actionPath="/video-detection"
                                iconColor="#52c41a"
                            />
                        </Col>
                    </Row>
                </Col>

                {/* 特性介绍区域 */}
                <Col span={24}>
                    <Divider orientation="left">系统特点</Divider>
                    <Row gutter={[24, 24]}>
                        <Col span={24} md={8}>
                            <Card
                                title="高效便捷"
                                variant="borderless"
                                className="feature-card"
                                extra={<RocketOutlined />}
                            >
                                快速上传图片或视频文件，系统自动进行害虫识别并返回结果
                            </Card>
                        </Col>
                        <Col span={24} md={8}>
                            <Card
                                title="准确可靠"
                                variant="borderless"
                                className="feature-card"
                                extra={<SafetyCertificateOutlined />}
                            >
                                基于先进的YOLOv8目标检测模型，准确率高，可识别多种常见农作物害虫
                            </Card>
                        </Col>
                        <Col span={24} md={8}>
                            <Card
                                title="功能丰富"
                                variant="borderless"
                                className="feature-card"
                                extra={<AppstoreOutlined />}
                            >
                                支持单张识别、批量处理和视频分析，提供详细的检测结果和标注图像
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </div>
    )
}

export default Home
