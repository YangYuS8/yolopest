import React from 'react'
import { Row, Col, Image, Descriptions } from 'antd'
import { VideoResult } from '../../../types'
import { HistoryRecord } from '../../../types/history'

interface VideoResultViewProps {
    record: HistoryRecord
    formatDate: (timestamp: number) => string
}

export const VideoResultView: React.FC<VideoResultViewProps> = ({
    record,
    formatDate,
}) => {
    const videoResult = record.result as VideoResult

    return (
        <Row gutter={[16, 16]}>
            <Col span={24} md={12}>
                {record.thumbnail && (
                    <Image
                        src={record.thumbnail}
                        alt={record.filename}
                        style={{ maxWidth: '100%' }}
                    />
                )}
            </Col>
            <Col span={24} md={12}>
                <Descriptions title="检测信息" bordered column={1}>
                    <Descriptions.Item label="文件名">
                        {record.filename}
                    </Descriptions.Item>
                    <Descriptions.Item label="检测时间">
                        {formatDate(record.timestamp)}
                    </Descriptions.Item>
                    <Descriptions.Item label="视频长度">
                        {videoResult.video_length?.toFixed(2)}秒
                    </Descriptions.Item>
                    <Descriptions.Item label="处理帧数">
                        {videoResult.processed_frames}帧
                    </Descriptions.Item>
                    <Descriptions.Item label="处理速率">
                        {videoResult.fps?.toFixed(2)}帧/秒
                    </Descriptions.Item>
                </Descriptions>
            </Col>
        </Row>
    )
}
