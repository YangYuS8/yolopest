import React, { useMemo, useState } from 'react'
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    Legend,
    Area,
    Line,
    Bar,
    ComposedChart,
    Brush,
} from 'recharts'
import { Space, Tooltip, Card, Statistic, Row, Col, Radio } from 'antd'
import {
    InfoCircleOutlined,
    RiseOutlined,
    FallOutlined,
    AreaChartOutlined,
    LineChartOutlined,
    BarChartOutlined,
} from '@ant-design/icons'
import { ChartDownloadButton } from '../../common/ChartDownloadButton/ChartDownloadButton'

interface TrendChartProps {
    data: {
        date: string
        count: number
    }[]
}

export const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
    // 计算统计数据
    const statistics = useMemo(() => {
        if (data.length === 0)
            return { total: 0, avg: 0, trend: 0, max: { date: '', count: 0 } }

        const total = data.reduce((sum, item) => sum + item.count, 0)
        const avg = total / data.length

        // 计算趋势（最近7天与之前相比）
        const recentPeriod = Math.min(7, Math.floor(data.length / 2))
        if (data.length < 4)
            return {
                total,
                avg,
                trend: 0,
                max: data.reduce(
                    (max, item) => (item.count > max.count ? item : max),
                    data[0]
                ),
            }

        const recentData = data.slice(-recentPeriod)
        const previousData = data.slice(-recentPeriod * 2, -recentPeriod)

        const recentAvg =
            recentData.reduce((sum, item) => sum + item.count, 0) / recentPeriod
        const previousAvg = previousData.length
            ? previousData.reduce((sum, item) => sum + item.count, 0) /
              previousData.length
            : 0

        const trend =
            previousAvg !== 0
                ? ((recentAvg - previousAvg) / previousAvg) * 100
                : 0

        // 找出最大值
        const max = data.reduce(
            (max, item) => (item.count > max.count ? item : max),
            data[0]
        )

        return { total, avg, trend, max }
    }, [data])

    // 添加数据优化逻辑
    const optimizedData = useMemo(() => {
        // 当数据量超过某个阈值时进行采样
        const MAX_POINTS = 60
        if (data.length <= MAX_POINTS) return data

        // 简单采样逻辑
        const samplingRate = Math.ceil(data.length / MAX_POINTS)
        const result = []

        for (let i = 0; i < data.length; i += samplingRate) {
            const chunk = data.slice(i, Math.min(i + samplingRate, data.length))
            const sum = chunk.reduce((acc, item) => acc + item.count, 0)
            const avgCount = Math.round(sum / chunk.length)

            result.push({
                date: chunk[0].date,
                count: avgCount,
            })
        }

        return result
    }, [data])

    // 添加视图切换功能
    const [viewMode, setViewMode] = useState<'area' | 'line' | 'bar'>('area')

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20,
                }}
            >
                <h3 style={{ margin: 0 }}>害虫检测趋势分析</h3>
                <Space>
                    <Tooltip title="查看近期害虫出现趋势，帮助预测未来可能的害虫活动">
                        <InfoCircleOutlined />
                    </Tooltip>
                    <ChartDownloadButton
                        containerSelector=".trend-chart-container"
                        fileNamePrefix="害虫趋势分析"
                    />
                </Space>
            </div>

            <Space style={{ marginBottom: 16 }}>
                <Radio.Group
                    size="small"
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                >
                    <Radio.Button value="area">
                        <AreaChartOutlined /> 区域图
                    </Radio.Button>
                    <Radio.Button value="line">
                        <LineChartOutlined /> 折线图
                    </Radio.Button>
                    <Radio.Button value="bar">
                        <BarChartOutlined /> 柱状图
                    </Radio.Button>
                </Radio.Group>
            </Space>

            {data.length > 0 && (
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={8}>
                        <Card size="small">
                            <Statistic
                                title="总检测数"
                                value={statistics.total}
                                precision={0}
                                suffix="个"
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card size="small">
                            <Statistic
                                title="日均检测"
                                value={statistics.avg}
                                precision={1}
                                suffix="个/天"
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card size="small">
                            <Statistic
                                title="近期趋势"
                                value={statistics.trend}
                                precision={1}
                                prefix={
                                    statistics.trend >= 0 ? (
                                        <RiseOutlined />
                                    ) : (
                                        <FallOutlined />
                                    )
                                }
                                valueStyle={{
                                    color:
                                        statistics.trend >= 0
                                            ? '#cf1322'
                                            : '#3f8600',
                                }}
                                suffix="%"
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            <div
                className="trend-chart-container"
                style={{ width: '100%', height: 400 }}
            >
                <ResponsiveContainer>
                    <ComposedChart
                        data={optimizedData}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 30,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            label={{
                                value: '日期',
                                position: 'insideBottomRight',
                                offset: -10,
                            }}
                            scale="band"
                            tickCount={Math.min(data.length, 10)}
                        />
                        <YAxis
                            label={{
                                value: '检测数量',
                                angle: -90,
                                position: 'insideLeft',
                                offset: 15,
                            }}
                        />
                        <RechartsTooltip
                            formatter={(value) => [`${value} 个`, '检测数量']}
                            labelFormatter={(label) => `日期: ${label}`}
                        />
                        <Legend />
                        {viewMode === 'area' && (
                            <Area
                                type="monotone"
                                dataKey="count"
                                name="检测数量"
                                stroke="#1890ff"
                                fill="#1890ff66"
                                strokeWidth={3}
                                activeDot={{ r: 6 }}
                            />
                        )}
                        {viewMode === 'line' && (
                            <Line
                                type="monotone"
                                dataKey="count"
                                name="检测数量"
                                stroke="#1890ff"
                                strokeWidth={3}
                                activeDot={{ r: 6 }}
                            />
                        )}
                        {viewMode === 'bar' && (
                            <Bar
                                dataKey="count"
                                name="检测数量"
                                fill="#1890ff"
                            />
                        )}
                        {optimizedData.length > 7 && (
                            <Brush
                                dataKey="date"
                                height={30}
                                stroke="#8884d8"
                            />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {statistics.max.count > 0 && (
                <div
                    style={{
                        marginTop: 16,
                        fontSize: '14px',
                        color: 'rgba(0, 0, 0, 0.65)',
                    }}
                >
                    <p>
                        峰值出现在 <strong>{statistics.max.date}</strong>
                        ，检测数量为 <strong>{statistics.max.count}</strong> 个
                    </p>
                </div>
            )}
        </div>
    )
}
