// 精确度分析组件
import React from 'react'
import { Card, Row, Col, Progress, Typography, Table } from 'antd'
const { Title, Text } = Typography

interface AccuracyAnalysisProps {
    confidenceData: number[]
    pestTypes: Array<{ name: string; avgConfidence: number }>
}

export const AccuracyAnalysis: React.FC<AccuracyAnalysisProps> = ({
    confidenceData,
    pestTypes,
}) => {
    // 计算高置信度预测比例 (>0.8)
    const highConfidenceCount = confidenceData.filter(
        (conf) => conf >= 0.8
    ).length
    const highConfidencePercent = confidenceData.length
        ? Math.round((highConfidenceCount / confidenceData.length) * 100)
        : 0

    // 按平均置信度排序的害虫类型
    const sortedPestTypes = [...pestTypes].sort(
        (a, b) => b.avgConfidence - a.avgConfidence
    )

    const columns = [
        {
            title: '害虫类型',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '平均置信度',
            dataIndex: 'avgConfidence',
            key: 'avgConfidence',
            render: (val: number) => `${(val * 100).toFixed(1)}%`,
            sorter: (
                a: { avgConfidence: number },
                b: { avgConfidence: number }
            ) => a.avgConfidence - b.avgConfidence,
        },
        {
            title: '置信度分布',
            dataIndex: 'avgConfidence',
            key: 'confidenceBar',
            render: (val: number) => (
                <Progress
                    percent={val * 100}
                    size="small"
                    status={
                        val >= 0.7
                            ? 'success'
                            : val >= 0.5
                              ? 'normal'
                              : 'exception'
                    }
                />
            ),
        },
    ]

    return (
        <div>
            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Title level={4}>检测精确度分析</Title>
                    <Text>YOLOv12模型检测的置信度分布和准确性分析</Text>
                </Col>
                <Col span={24} md={12}>
                    <Card title="高置信度预测比例">
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <Progress
                                type="dashboard"
                                percent={highConfidencePercent}
                                format={(percent) => `${percent}%`}
                                size={200}
                            />
                            <div style={{ marginTop: 16 }}>
                                <Text>
                                    共{confidenceData.length}个预测中，
                                    {highConfidenceCount}个具有高置信度(≥80%)
                                </Text>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col span={24} md={12}>
                    <Card title="各害虫类型平均置信度">
                        <Table
                            dataSource={sortedPestTypes}
                            columns={columns}
                            pagination={false}
                            size="small"
                            rowKey="name"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    )
}
