import React, { useState, useEffect } from 'react'
import './VideoDetection.css'
import {
    Row,
    Col,
    Card,
    Button,
    Typography,
    Tabs,
    Statistic,
    Tag,
    Empty,
    message,
    Progress,
} from 'antd'
import { VideoPlayer } from '../components/media'
import { VideoAnalysisResults, FrameDetectionView } from '../components/display'
import { useVideoUpload } from '../hooks/useVideoUpload'
import { useVideoPlayer } from '../hooks/useVideoPlayer'
import { getPestStatistics } from '../services/mediaService'
import { PageLayout } from '../components/layout'
import {
    DownloadOutlined,
    LineChartOutlined,
    DeleteOutlined,
    CloudUploadOutlined,
    PlayCircleOutlined,
    BarChartOutlined,
    FileImageOutlined,
    ExperimentOutlined,
    UploadOutlined,
    InfoCircleOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography
const { TabPane } = Tabs

const VideoDetection: React.FC = () => {
    const {
        videoUrl,
        result,
        loading,
        progress,
        handleVideoSelect,
        clearResults,
    } = useVideoUpload()

    const { currentFrame, findFrameByTime } = useVideoPlayer()
    const [pestStats, setPestStats] = useState<[string, number][]>([])
    const [activeTab, setActiveTab] = useState<string>('upload')

    // 当视频播放时间更新时，查找对应的检测帧
    const handleTimeUpdate = (time: number) => {
        if (result) {
            findFrameByTime(time, result)
        }
    }

    // 修改useEffect部分，增强状态检查和日志
    useEffect(() => {
        if (result) {
            console.log('检测结果状态:', result.status)

            // 处理统计数据
            if (result.results) {
                const stats = getPestStatistics(result.results)
                setPestStats(
                    Array.from(stats.entries()).sort((a, b) => b[1] - a[1])
                )
            }

            // 修改判断逻辑：只要result存在且有task_id，就启用分析页面
            if (result.task_id) {
                console.log('视频处理已完成，切换到分析页面')
                setActiveTab('analysis')
            }
        }
    }, [result])

    // 修改handleDownloadVideo函数

    const handleDownloadVideo = () => {
        if (!result?.task_id) {
            message.error('无法下载：未找到有效的视频任务')
            return
        }

        // 直接通过新的API下载，而不是构建URL
        window.open(
            `${import.meta.env.VITE_API_URL}/video/download/${result.task_id}`
        )

        message.success('开始下载标注视频')
    }

    // 清除结果并自动切换到上传页签
    const handleClearResults = () => {
        clearResults()
        setActiveTab('upload')
    }

    return (
        <PageLayout title="视频害虫检测">
            <div className="video-detection-container">
                {/* 页面主标题 */}
                <div className="page-header">
                    <div className="page-title">
                        <ExperimentOutlined className="title-icon" />
                        <Title level={2}>
                            上传需要检测的视频，返回检测结果
                        </Title>
                    </div>
                    <div className="action-buttons">
                        {result?.task_id && (
                            <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                onClick={handleDownloadVideo}
                                size="large"
                                className="download-button"
                            >
                                下载标注视频
                            </Button>
                        )}
                        {result && (
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={handleClearResults}
                                size="large"
                            >
                                清除结果
                            </Button>
                        )}
                    </div>
                </div>

                {/* 主要内容区 */}
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    type="card"
                    className="main-tabs"
                >
                    {/* 上传标签页 */}
                    <TabPane
                        tab={
                            <>
                                <CloudUploadOutlined /> 上传视频
                            </>
                        }
                        key="upload"
                    >
                        <div className="upload-container">
                            <Row gutter={[24, 24]}>
                                <Col xs={24} md={12}>
                                    <Card
                                        title={
                                            <>
                                                <CloudUploadOutlined /> 视频预览
                                            </>
                                        }
                                        className="upload-card"
                                    >
                                        {videoUrl && !loading ? (
                                            // 已上传视频的预览区域
                                            <div className="video-preview-container">
                                                <div className="video-container">
                                                    <video
                                                        src={videoUrl}
                                                        style={{
                                                            width: '100%',
                                                            maxHeight: '240px',
                                                        }}
                                                        controls
                                                    />
                                                </div>
                                                <div
                                                    className="upload-actions"
                                                    style={{
                                                        marginTop: '16px',
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    <Button
                                                        type="primary"
                                                        onClick={() => {
                                                            const input =
                                                                document.createElement(
                                                                    'input'
                                                                )
                                                            input.type = 'file'
                                                            input.accept =
                                                                '.mp4,.webm,.mov'
                                                            input.onchange = (
                                                                e
                                                            ) => {
                                                                const files = (
                                                                    e.target as HTMLInputElement
                                                                ).files
                                                                if (
                                                                    files &&
                                                                    files.length >
                                                                        0
                                                                ) {
                                                                    handleVideoSelect(
                                                                        files[0]
                                                                    )
                                                                }
                                                            }
                                                            input.click()
                                                        }}
                                                        icon={
                                                            <UploadOutlined />
                                                        }
                                                    >
                                                        重新选择视频
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            // 未上传视频时的上传区域
                                            <div className="upload-area">
                                                <div
                                                    className="upload-dropzone"
                                                    style={{
                                                        border: '2px dashed #d9d9d9',
                                                        borderRadius: '8px',
                                                        padding: '32px 16px',
                                                        textAlign: 'center',
                                                        background: '#fafafa',
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={() => {
                                                        const input =
                                                            document.createElement(
                                                                'input'
                                                            )
                                                        input.type = 'file'
                                                        input.accept =
                                                            '.mp4,.webm,.mov'
                                                        input.onchange = (
                                                            e
                                                        ) => {
                                                            const files = (
                                                                e.target as HTMLInputElement
                                                            ).files
                                                            if (
                                                                files &&
                                                                files.length > 0
                                                            ) {
                                                                handleVideoSelect(
                                                                    files[0]
                                                                )
                                                            }
                                                        }
                                                        input.click()
                                                    }}
                                                    onDragOver={(e) => {
                                                        e.preventDefault()
                                                        e.currentTarget.style.borderColor =
                                                            '#1890ff'
                                                        e.currentTarget.style.background =
                                                            '#e6f7ff'
                                                    }}
                                                    onDragLeave={(e) => {
                                                        e.preventDefault()
                                                        e.currentTarget.style.borderColor =
                                                            '#d9d9d9'
                                                        e.currentTarget.style.background =
                                                            '#fafafa'
                                                    }}
                                                    onDrop={(e) => {
                                                        e.preventDefault()
                                                        e.currentTarget.style.borderColor =
                                                            '#d9d9d9'
                                                        e.currentTarget.style.background =
                                                            '#fafafa'
                                                        const files =
                                                            e.dataTransfer.files
                                                        if (
                                                            files &&
                                                            files.length > 0
                                                        ) {
                                                            // 检查文件类型
                                                            const file =
                                                                files[0]
                                                            const validTypes = [
                                                                '.mp4',
                                                                '.webm',
                                                                '.mov',
                                                                'video/mp4',
                                                                'video/webm',
                                                                'video/quicktime',
                                                            ]
                                                            const isValid =
                                                                validTypes.some(
                                                                    (type) =>
                                                                        file.name
                                                                            .toLowerCase()
                                                                            .endsWith(
                                                                                type
                                                                            ) ||
                                                                        file.type.includes(
                                                                            type
                                                                        )
                                                                )

                                                            if (isValid) {
                                                                handleVideoSelect(
                                                                    file
                                                                )
                                                            } else {
                                                                message.error(
                                                                    '请上传有效的视频文件（MP4、WebM、MOV）'
                                                                )
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <p>
                                                        <UploadOutlined
                                                            style={{
                                                                fontSize:
                                                                    '48px',
                                                                color: '#1890ff',
                                                            }}
                                                        />
                                                    </p>
                                                    <p>
                                                        点击或拖放视频文件到此区域
                                                    </p>
                                                    <p
                                                        style={{
                                                            color: '#888',
                                                        }}
                                                    >
                                                        支持格式：MP4、WebM、MOV
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </Card>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Card
                                        title={
                                            <>
                                                <LineChartOutlined /> 处理状态
                                            </>
                                        }
                                        className="progress-card"
                                    >
                                        {loading ? (
                                            <div className="processing-status">
                                                <Statistic
                                                    title="视频处理进度"
                                                    value={progress}
                                                    suffix="%"
                                                />
                                                <div className="status-tag">
                                                    <Tag color="processing">
                                                        处理中
                                                    </Tag>
                                                </div>
                                                <Progress
                                                    percent={progress}
                                                    status="active"
                                                    strokeColor={{
                                                        from: '#108ee9',
                                                        to: '#87d068',
                                                    }}
                                                    style={{
                                                        marginTop: 16,
                                                        marginBottom: 16,
                                                    }}
                                                />
                                                <div className="upload-progress-details">
                                                    <p>
                                                        <InfoCircleOutlined />{' '}
                                                        文件上传完成，视频正在分析处理...
                                                    </p>
                                                    <p>
                                                        <ClockCircleOutlined />{' '}
                                                        视频处理可能需要较长时间，请耐心等待
                                                    </p>
                                                    <p>
                                                        <ExperimentOutlined />{' '}
                                                        系统正在分析每一帧并检测害虫
                                                    </p>
                                                </div>
                                            </div>
                                        ) : result ? (
                                            <div className="processing-complete">
                                                <Statistic
                                                    title="处理状态"
                                                    value={
                                                        result.status || '完成'
                                                    }
                                                    valueStyle={{
                                                        color: '#3f8600',
                                                    }}
                                                />
                                                <p
                                                    style={{
                                                        margin: '8px 0',
                                                        fontSize: '12px',
                                                        color: '#888',
                                                    }}
                                                >
                                                    任务ID:{' '}
                                                    {result.task_id || '未知'}
                                                </p>
                                                <div
                                                    className="status-tag"
                                                    style={{ margin: '16px 0' }}
                                                >
                                                    <Tag color="success">
                                                        已完成
                                                    </Tag>
                                                </div>

                                                {/* 添加处理结果统计信息 */}
                                                <div
                                                    className="result-summary"
                                                    style={{
                                                        textAlign: 'left',
                                                        background: '#f9f9f9',
                                                        padding: '12px',
                                                        borderRadius: '4px',
                                                        marginBottom: '16px',
                                                    }}
                                                >
                                                    <p>
                                                        <CheckCircleOutlined />{' '}
                                                        共处理{' '}
                                                        {result.processed_frames ||
                                                            0}{' '}
                                                        帧
                                                    </p>
                                                    <p>
                                                        <ClockCircleOutlined />{' '}
                                                        处理耗时:{' '}
                                                        {result.time_cost?.toFixed(
                                                            2
                                                        ) || '0'}{' '}
                                                        秒
                                                    </p>
                                                    <p>
                                                        <LineChartOutlined />{' '}
                                                        处理速率:{' '}
                                                        {result.fps?.toFixed(
                                                            2
                                                        ) || '0'}{' '}
                                                        帧/秒
                                                    </p>
                                                </div>

                                                <Button
                                                    type="primary"
                                                    onClick={() =>
                                                        setActiveTab('analysis')
                                                    }
                                                    style={{ marginTop: 16 }}
                                                    block
                                                >
                                                    查看分析结果
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="upload-instruction">
                                                <Empty
                                                    image={
                                                        Empty.PRESENTED_IMAGE_SIMPLE
                                                    }
                                                    description="请上传视频文件开始分析"
                                                />
                                                <Text type="secondary">
                                                    支持的视频格式：MP4、WebM、MOV
                                                </Text>
                                            </div>
                                        )}
                                    </Card>
                                </Col>
                            </Row>
                        </div>
                    </TabPane>

                    {/* 分析结果标签页 */}
                    <TabPane
                        tab={
                            <>
                                <BarChartOutlined /> 分析结果
                            </>
                        }
                        key="analysis"
                        disabled={!result || !result.task_id} // 只要有task_id就可以启用
                    >
                        {/* 添加独立下载按钮区域 */}
                        {result?.task_id && (
                            <Card
                                className="download-card"
                                style={{
                                    marginBottom: '16px',
                                    background: '#f6ffed',
                                    border: '1px solid #b7eb8f',
                                }}
                            >
                                <Row align="middle" gutter={16}>
                                    <Col xs={24} sm={16}>
                                        <div>
                                            <Title
                                                level={5}
                                                style={{ margin: 0 }}
                                            >
                                                标注视频已生成
                                            </Title>
                                            <Text type="secondary">
                                                由于浏览器兼容性问题，标注视频可能无法直接播放。请点击下载按钮保存后查看。
                                            </Text>
                                        </div>
                                    </Col>
                                </Row>
                            </Card>
                        )}

                        <Row gutter={[24, 24]}>
                            {/* 视频播放区 */}
                            <Col xs={24} lg={16}>
                                <Card
                                    title={
                                        <>
                                            <PlayCircleOutlined /> 视频播放
                                        </>
                                    }
                                    className="video-player-wrapper"
                                >
                                    {videoUrl && (
                                        <VideoPlayer
                                            videoUrl={videoUrl}
                                            result={result}
                                            onTimeUpdate={handleTimeUpdate}
                                        />
                                    )}
                                </Card>
                            </Col>

                            {/* 检测统计区 */}
                            <Col xs={24} lg={8}>
                                <Card
                                    title={
                                        <>
                                            <LineChartOutlined /> 检测统计
                                        </>
                                    }
                                    className="statistics-card"
                                >
                                    {result && (
                                        <VideoAnalysisResults
                                            result={result}
                                            pestStats={pestStats}
                                            clearResults={null}
                                        />
                                    )}
                                </Card>
                            </Col>

                            {/* 当前帧分析区 */}
                            <Col xs={24}>
                                <Card
                                    title={
                                        <>
                                            <FileImageOutlined /> 当前帧检测详情
                                        </>
                                    }
                                    className="frame-detection-card"
                                >
                                    <FrameDetectionView
                                        currentFrame={currentFrame}
                                    />
                                </Card>
                            </Col>
                        </Row>
                    </TabPane>
                </Tabs>
            </div>
        </PageLayout>
    )
}

export default VideoDetection
