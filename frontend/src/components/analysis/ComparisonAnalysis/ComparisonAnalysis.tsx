// 环比分析组件
import React from 'react'
import { Card, Row, Col, Statistic, Table, Tag } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'

interface ComparisonAnalysisProps {
    currentData: {
        total: number
        byType: Array<{ name: string; count: number }>
    }
    previousData: {
        total: number
        byType: Array<{ name: string; count: number }>
    }
}

export const ComparisonAnalysis: React.FC<ComparisonAnalysisProps> = ({
    currentData,
    previousData,
}) => {
    // 计算环比变化
    const totalChange =
        previousData.total === 0
            ? 100
            : ((currentData.total - previousData.total) / previousData.total) *
              100

    // 计算每种害虫的环比变化
    const typeComparison = currentData.byType.map((current) => {
        const previous = previousData.byType.find(
            (p) => p.name === current.name
        )
        const prevCount = previous?.count || 0
        const change =
            prevCount === 0
                ? 100
                : ((current.count - prevCount) / prevCount) * 100

        return {
            name: current.name,
            current: current.count,
            previous: prevCount,
            change,
        }
    })

    const columns = [
        {
            title: '害虫类型',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '当前周期',
            dataIndex: 'current',
            key: 'current',
        },
        {
            title: '上一周期',
            dataIndex: 'previous',
            key: 'previous',
        },
        {
            title: '环比变化',
            dataIndex: 'change',
            key: 'change',
            render: (val: number) => (
                <span>
                    {val > 0 ? (
                        <Tag color="red">
                            <ArrowUpOutlined /> {val.toFixed(1)}%
                        </Tag>
                    ) : val < 0 ? (
                        <Tag color="green">
                            <ArrowDownOutlined /> {Math.abs(val).toFixed(1)}%
                        </Tag>
                    ) : (
                        <Tag color="blue">0%</Tag>
                    )}
                </span>
            ),
            sorter: (a: { change: number }, b: { change: number }) =>
                a.change - b.change,
        },
    ]

    return (
        <Card title="环比分析">
            <Row gutter={[24, 24]}>
                <Col span={24} md={8}>
                    <Statistic
                        title="当前周期检测总数"
                        value={currentData.total}
                        precision={0}
                    />
                </Col>
                <Col span={24} md={8}>
                    <Statistic
                        title="上一周期检测总数"
                        value={previousData.total}
                        precision={0}
                    />
                </Col>
                <Col span={24} md={8}>
                    <Statistic
                        title="环比变化"
                        value={totalChange}
                        precision={2}
                        valueStyle={{
                            color: totalChange >= 0 ? '#cf1322' : '#3f8600',
                        }}
                        prefix={
                            totalChange >= 0 ? (
                                <ArrowUpOutlined />
                            ) : (
                                <ArrowDownOutlined />
                            )
                        }
                        suffix="%"
                    />
                </Col>
                <Col span={24}>
                    <Table
                        dataSource={typeComparison}
                        columns={columns}
                        pagination={false}
                        rowKey="name"
                    />
                </Col>
            </Row>
        </Card>
    )
}
