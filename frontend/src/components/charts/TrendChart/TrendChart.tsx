import React, { useMemo, useState } from 'react'
import {
    ComposedChart,
    Line,
    Area,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
    Brush,
} from 'recharts'
import { Card, Statistic, Row, Col } from 'antd'
import { RiseOutlined, FallOutlined } from '@ant-design/icons'
import { BaseChartContainer } from '../BaseChartContainer/BaseChartContainer'
import {
    ChartViewSwitcher,
    ChartViewMode,
} from '../ChartViewSwitcher/ChartViewSwitcher'
import { ChartTheme } from '../../../utils/chartTheme'
import {
    sampleData,
    calculateStatistics,
    calculateTrend,
} from '../../../utils/chartDataUtils'

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

        const { total, avg, max } = calculateStatistics(data, 'count')

        // 计算趋势（最近7天与之前相比）
        const recentPeriod = Math.min(7, Math.floor(data.length / 2))
        if (data.length < 4) return { total, avg, trend: 0, max }

        const recentData = data.slice(-recentPeriod)
        const previousData = data.slice(-recentPeriod * 2, -recentPeriod)
        const trend = calculateTrend(recentData, previousData, 'count')

        return { total, avg, trend, max }
    }, [data])

    // 优化数据
    const optimizedData = useMemo(() => {
        return sampleData(data, 60, 'count')
    }, [data])

    // 视图切换
    const [viewMode, setViewMode] = useState<ChartViewMode>('area')

    // 图表额外控件
    const extraControls = (
        <div style={{ display: 'inline-block' }}>
            <ChartViewSwitcher viewMode={viewMode} onChange={setViewMode} />
        </div>
    )

    // 统计卡片
    const statsCards = data.length > 0 && (
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
                                    ? ChartTheme.colors.trend.positive
                                    : ChartTheme.colors.trend.negative,
                        }}
                        suffix="%"
                    />
                </Card>
            </Col>
        </Row>
    )

    // 峰值信息
    const peakInfo = statistics.max && statistics.max.count > 0 && (
        <div style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.65)' }}>
            <p>
                峰值出现在 <strong>{statistics.max.date}</strong>
                ，检测数量为 <strong>{statistics.max.count}</strong> 个
            </p>
        </div>
    )

    return (
        <BaseChartContainer
            title="害虫检测趋势分析"
            tooltip="查看近期害虫出现趋势，帮助预测未来可能的害虫活动"
            containerSelector=".trend-chart-container"
            fileNamePrefix="害虫趋势分析"
            extraActions={extraControls}
            rawData={data}
            csvHeaders={['date', 'count']}
            footer={peakInfo}
        >
            {statsCards}

            <ResponsiveContainer height={ChartTheme.responsiveHeight.default}>
                <ComposedChart
                    data={optimizedData}
                    margin={ChartTheme.margin.withBothLabels}
                >
                    <CartesianGrid
                        strokeDasharray={ChartTheme.axisStyle.strokeDasharray}
                        stroke={ChartTheme.axisStyle.stroke}
                    />
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
                        contentStyle={ChartTheme.tooltipStyle}
                    />
                    <Legend />

                    {viewMode === 'area' && (
                        <Area
                            type="monotone"
                            dataKey="count"
                            name="检测数量"
                            stroke={ChartTheme.colors.trend.line}
                            fill={ChartTheme.colors.trend.area}
                            strokeWidth={3}
                            activeDot={{ r: 6 }}
                            isAnimationActive={
                                ChartTheme.animation.default.isAnimationActive
                            }
                            animationBegin={
                                ChartTheme.animation.default.animationBegin
                            }
                            animationDuration={
                                ChartTheme.animation.default.animationDuration
                            }
                            animationEasing="ease-out"
                        />
                    )}
                    {viewMode === 'line' && (
                        <Line
                            type="monotone"
                            dataKey="count"
                            name="检测数量"
                            stroke={ChartTheme.colors.trend.line}
                            strokeWidth={3}
                            activeDot={{ r: 6 }}
                            isAnimationActive={
                                ChartTheme.animation.default.isAnimationActive
                            }
                            animationBegin={
                                ChartTheme.animation.default.animationBegin
                            }
                            animationDuration={
                                ChartTheme.animation.default.animationDuration
                            }
                            animationEasing="ease-out"
                        />
                    )}
                    {viewMode === 'bar' && (
                        <Bar
                            dataKey="count"
                            name="检测数量"
                            fill={ChartTheme.colors.trend.line}
                            isAnimationActive={
                                ChartTheme.animation.default.isAnimationActive
                            }
                            animationBegin={
                                ChartTheme.animation.default.animationBegin
                            }
                            animationDuration={
                                ChartTheme.animation.default.animationDuration
                            }
                            animationEasing="ease-out"
                        />
                    )}

                    {optimizedData.length > 7 && (
                        <Brush dataKey="date" height={30} stroke="#8884d8" />
                    )}
                </ComposedChart>
            </ResponsiveContainer>
        </BaseChartContainer>
    )
}
