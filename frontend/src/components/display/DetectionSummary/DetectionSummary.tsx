import React from 'react'
import { Space, Tag, Typography } from 'antd'
import { DetectionItem } from '../../../types'

const { Text } = Typography

interface DetectionSummaryProps {
    detections: DetectionItem[]
    processedTime?: number
}

const DetectionSummary: React.FC<DetectionSummaryProps> = ({
    detections,
    processedTime,
}) => {
    // 统计各类害虫数量
    const pestCounts = detections.reduce(
        (acc, item) => {
            acc[item.class] = (acc[item.class] || 0) + 1
            return acc
        },
        {} as Record<string, number>
    )

    return (
        <div className="detection-summary">
            {processedTime !== undefined && (
                <Text>检测耗时: {processedTime}s</Text>
            )}

            <div style={{ marginTop: 8 }}>
                <Text strong>检测结果: </Text>
                <Space wrap style={{ marginTop: 4 }}>
                    {Object.entries(pestCounts).map(([pestType, count]) => (
                        <Tag color="blue" key={pestType}>
                            {pestType}: {count}个
                        </Tag>
                    ))}
                </Space>
            </div>

            {detections.length === 0 && (
                <Text type="secondary" style={{ marginTop: 8 }}>
                    未检测到害虫
                </Text>
            )}
        </div>
    )
}

export default DetectionSummary
