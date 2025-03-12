import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Progress, Alert, Divider, Tag, List } from 'antd'
import VideoUploader from '../components/VideoUploader/VideoUploader'
import VideoPlayer from '../components/VideoPlayer/VideoPlayer'
import { useVideoUpload } from '../hooks/useVideoUpload'
import { useVideoPlayer } from '../hooks/useVideoPlayer'
import { getPestStatistics } from '../services/mediaService'

const VideoDetection: React.FC = () => {
    const { videoUrl, result, loading, progress, handleVideoSelect } =
        useVideoUpload()

    const { currentFrame, findFrameByTime } = useVideoPlayer()
    const [pestStats, setPestStats] = useState<[string, number][]>([])

    // 当视频播放时间更新时，查找对应的检测帧
    const handleTimeUpdate = (time: number) => {
        if (result) {
            findFrameByTime(time, result)
        }
    }

    // 当检测结果改变时，更新害虫统计数据
    useEffect(() => {
        if (result && result.results) {
            const stats = getPestStatistics(result.results)
            setPestStats(
                Array.from(stats.entries()).sort((a, b) => b[1] - a[1])
            )
        }
    }, [result])

    return (
        <div style={{ padding: '20px', width: '100%' }}>
            <h1>视频害虫检测</h1>
            <Divider />

            <Row gutter={[16, 16]}>
                <Col span={24} md={12}>
                    <VideoUploader onVideoSelect={handleVideoSelect} />

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

                    {result && (
                        <Card title="视频分析结果" style={{ marginTop: 16 }}>
                            <p>分析耗时: {result.time_cost.toFixed(2)}秒</p>
                            <p>视频长度: {result.video_length.toFixed(2)}秒</p>
                            <p>处理帧数: {result.processed_frames}帧</p>
                            <p>检测速率: {result.fps.toFixed(2)}帧/秒</p>

                            <Divider>检测统计</Divider>

                            <List
                                size="small"
                                dataSource={pestStats}
                                renderItem={([pestType, count]) => (
                                    <List.Item>
                                        <Tag color="green">{pestType}</Tag>
                                        共检测到 <strong>{count}</strong> 次
                                    </List.Item>
                                )}
                            />
                        </Card>
                    )}
                </Col>

                <Col span={24} md={12}>
                    {videoUrl && (
                        <VideoPlayer
                            videoUrl={videoUrl}
                            result={result}
                            onTimeUpdate={handleTimeUpdate}
                        />
                    )}

                    {currentFrame && (
                        <Card
                            title={`当前帧检测结果 (帧 ${currentFrame.frame_index})`}
                        >
                            {currentFrame.annotated_frame ? (
                                <img
                                    src={currentFrame.annotated_frame}
                                    alt="标注帧"
                                    style={{ width: '100%' }}
                                />
                            ) : (
                                <Alert
                                    message="此帧无标注图像"
                                    type="warning"
                                />
                            )}

                            <Divider>检测到的目标</Divider>

                            {currentFrame.detections.length > 0 ? (
                                currentFrame.detections.map(
                                    (detection, idx) => (
                                        <div
                                            key={idx}
                                            style={{ marginBottom: 12 }}
                                        >
                                            <p>
                                                害虫类型:{' '}
                                                <Tag color="blue">
                                                    {detection.class}
                                                </Tag>
                                                置信度:{' '}
                                                {(
                                                    detection.confidence * 100
                                                ).toFixed(1)}
                                                %
                                            </p>
                                            <p>
                                                位置: X[{detection.bbox.x1}-
                                                {detection.bbox.x2}] Y[
                                                {detection.bbox.y1}-
                                                {detection.bbox.y2}]
                                            </p>
                                        </div>
                                    )
                                )
                            ) : (
                                <Alert message="此帧未检测到目标" type="info" />
                            )}
                        </Card>
                    )}
                </Col>
            </Row>
        </div>
    )
}

export default VideoDetection
