import React from 'react'
import { List, Tag, Card, Empty, Image, Typography } from 'antd'
import { DetectionItem } from '../../../types'

const { Text } = Typography

interface DetectionListProps {
    detectionItems: {
        id: string | number
        image: string
        results: DetectionItem[]
        title: string
        timestamp?: string
    }[]
    emptyText?: string
}

const DetectionList: React.FC<DetectionListProps> = ({
    detectionItems,
    emptyText = '暂无检测结果',
}) => {
    if (detectionItems.length === 0) {
        return <Empty description={emptyText} />
    }

    return (
        <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
            dataSource={detectionItems}
            renderItem={(item) => (
                <List.Item>
                    <Card
                        title={item.title}
                        extra={
                            item.timestamp && (
                                <Text type="secondary">{item.timestamp}</Text>
                            )
                        }
                        cover={
                            <div style={{ padding: 8 }}>
                                <Image src={item.image} alt={item.title} />
                            </div>
                        }
                    >
                        {item.results.length > 0 ? (
                            <>
                                <Text strong>检测到的害虫：</Text>
                                <div style={{ marginTop: 8 }}>
                                    {item.results.map((result, index) => (
                                        <Tag color="blue" key={index}>
                                            {result.class} (
                                            {(result.confidence * 100).toFixed(
                                                1
                                            )}
                                            %)
                                        </Tag>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <Text type="secondary">未检测到害虫</Text>
                        )}
                    </Card>
                </List.Item>
            )}
        />
    )
}

export default DetectionList
