import React from 'react'
import { Row, Col, Card, Statistic } from 'antd'
import { BugOutlined } from '@ant-design/icons'
import { StatisticsDataType } from '../../types/statistics'

interface StatisticsSummaryProps {
    statisticsData: StatisticsDataType | null
}

export const StatisticsSummary: React.FC<StatisticsSummaryProps> = ({
    statisticsData,
}) => {
    return (
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={8}>
                <Card>
                    <Statistic
                        title="总检测数"
                        value={statisticsData?.totalDetections || 0}
                        prefix={<BugOutlined />}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={8}>
                <Card>
                    <Statistic
                        title="害虫类型数"
                        value={statisticsData?.uniquePestTypes || 0}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={8}>
                <Card>
                    <Statistic
                        title="平均置信度"
                        value={(statisticsData?.averageConfidence || 0) * 100}
                        precision={2}
                        suffix="%"
                    />
                </Card>
            </Col>
        </Row>
    )
}
