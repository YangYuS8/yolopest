import React, { useState, useEffect } from 'react'
import { PageLayout } from '../components/layout'
import { Card, Row, Col, DatePicker, Radio, Spin, Statistic, Empty } from 'antd'
import {
    BugOutlined,
    AreaChartOutlined,
    BarChartOutlined,
    PieChartOutlined,
    CheckCircleOutlined,
    LineChartOutlined,
    SwapOutlined,
} from '@ant-design/icons'
import type { RangePickerProps } from 'antd/es/date-picker'
import {
    DistributionChart,
    TrendChart,
    ConfidenceChart,
} from '../components/charts'
import { AccuracyAnalysis } from '../components/analysis/AccuracyAnalysis/AccuracyAnalysis'
import { SpatialDistribution } from '../components/analysis/SpatialDistribution/SpatialDistribution'
import { ComparisonAnalysis } from '../components/analysis/ComparisonAnalysis/ComparisonAnalysis'
import { PredictionAnalysis } from '../components/analysis/PredictionAnalysis/PredictionAnalysis'

import { useHistory } from '../services/historyService'
import dayjs from 'dayjs'
import { HistoryRecord } from '../types/history'

const { RangePicker } = DatePicker

interface StatisticsDataType {
    pestDistribution: Array<{ name: string; value: number }>
    confidenceData: number[]
    trendData: Array<{ date: string; count: number }>
    totalDetections: number
    uniquePestTypes: number
    averageConfidence: number
}

const Statistics: React.FC = () => {
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().subtract(30, 'days'),
        dayjs(),
    ])
    const [chartType, setChartType] = useState<string>('trend')
    const [loading, setLoading] = useState<boolean>(true)
    const [statisticsData, setStatisticsData] =
        useState<StatisticsDataType | null>(null)

    const { records } = useHistory()

    const fetchData = React.useCallback(async () => {
        setLoading(true)
        try {
            const startTime = dateRange[0].valueOf()
            const endTime = dateRange[1].valueOf()

            // 过滤指定日期范围内的记录
            const filteredRecords = records.filter((record) => {
                return (
                    record.timestamp >= startTime && record.timestamp <= endTime
                )
            })

            // 处理数据以适合统计
            const processedData = processStatisticsData(filteredRecords)
            setStatisticsData(processedData)
        } catch (error) {
            console.error('获取统计数据失败:', error)
        } finally {
            setLoading(false)
        }
    }, [dateRange, records])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // 处理数据以生成统计结果
    const processStatisticsData = (
        records: HistoryRecord[]
    ): StatisticsDataType => {
        // 害虫类型分布
        const pestTypesMap = new Map<string, number>()
        // 置信度分布
        const confidenceData: number[] = []
        // 时间趋势数据
        const trendData: Array<{ date: string; count: number }> = []

        // 分析数据
        records.forEach((record) => {
            if (record.type === 'image') {
                // 处理图像记录
                const result = record.result
                if (result.predictions && result.predictions.length) {
                    // 添加到害虫类型分布
                    result.predictions.forEach((pred) => {
                        const type =
                            pred.class ||
                            (pred as { pest?: string }).pest ||
                            '未知'
                        pestTypesMap.set(
                            type,
                            (pestTypesMap.get(type) || 0) + 1
                        )
                        confidenceData.push(pred.confidence)
                    })

                    // 添加到时间趋势
                    const day = dayjs(record.timestamp).format('YYYY-MM-DD')
                    const existingDay = trendData.find(
                        (item) => item.date === day
                    )
                    if (existingDay) {
                        existingDay.count += result.predictions.length
                    } else {
                        trendData.push({
                            date: day,
                            count: result.predictions.length,
                        })
                    }
                }
            }
        })

        // 格式化害虫类型分布数据
        const pestDistribution = Array.from(pestTypesMap.entries()).map(
            ([name, value]) => ({
                name,
                value,
            })
        )

        // 排序时间趋势数据
        trendData.sort(
            (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()
        )

        return {
            pestDistribution,
            confidenceData,
            trendData,
            totalDetections: confidenceData.length,
            uniquePestTypes: pestTypesMap.size,
            averageConfidence: confidenceData.length
                ? confidenceData.reduce((sum, val) => sum + val, 0) /
                  confidenceData.length
                : 0,
        }
    }

    const handleDateRangeChange: RangePickerProps['onChange'] = (dates) => {
        if (dates && dates[0] && dates[1]) {
            setDateRange([dates[0], dates[1]])
        }
    }

    const calculateAvgConfidence = (pestName: string): number => {
        if (!statisticsData) return 0

        let total = 0
        let count = 0

        records.forEach((record) => {
            if (record.type === 'image' && record.result.predictions) {
                record.result.predictions.forEach((pred) => {
                    const type =
                        pred.class || (pred as { pest?: string }).pest || '未知'
                    if (type === pestName) {
                        total += pred.confidence
                        count++
                    }
                })
            }
        })

        return count > 0 ? total / count : 0
    }

    // 添加环比数据状态
    const [comparisonData, setComparisonData] = useState<{
        previous: StatisticsDataType | null
    }>({ previous: null })

    // 添加环比数据计算函数
    const calculateComparisonData = React.useCallback(() => {
        if (!statisticsData) return

        // 当前选择的时间范围
        const currentEnd = dateRange[1]
        const currentStart = dateRange[0]
        const daysDiff = currentEnd.diff(currentStart, 'day') + 1

        // 上一个相同长度的时间段
        const previousEnd = currentStart.subtract(1, 'day')
        const previousStart = previousEnd.subtract(daysDiff - 1, 'day')

        // 过滤记录
        const previousRecords = records.filter((record) => {
            const timestamp = record.timestamp
            return (
                timestamp >= previousStart.valueOf() &&
                timestamp <= previousEnd.valueOf()
            )
        })

        // 处理上个时间段的数据
        const previousData = processStatisticsData(previousRecords)

        setComparisonData({ previous: previousData })
    }, [dateRange, records, statisticsData])

    // 添加到useEffect
    useEffect(() => {
        if (statisticsData) {
            calculateComparisonData()
        }
    }, [statisticsData, calculateComparisonData])

    // 添加生成空间数据的函数
    const generateSpatialData = () => {
        if (!statisticsData) return []

        return statisticsData.pestDistribution.flatMap((item) => {
            const points = []
            const count = Math.min(item.value, 20)

            for (let i = 0; i < count; i++) {
                points.push({
                    x: Math.random(),
                    y: Math.random(),
                    type: item.name,
                    value: Math.random() * item.value,
                })
            }

            return points
        })
    }

    // 添加自定义样式，确保即使选中的选项也不会覆盖导航栏
    const radioGroupStyle: React.CSSProperties = {
        position: 'relative',
        zIndex: 0, // 确保低于导航栏的z-index
    }

    const cardStyle: React.CSSProperties = {
        overflow: 'hidden', // 确保内容不会溢出
        marginBottom: 16,
    }

    return (
        <PageLayout title="统计分析">
            <Card style={cardStyle}>
                <Row gutter={[16, 16]} justify="space-between" align="middle">
                    <Col>
                        <Radio.Group
                            value={chartType}
                            onChange={(e) => setChartType(e.target.value)}
                            buttonStyle="solid"
                            style={radioGroupStyle}
                        >
                            <Radio.Button value="trend">
                                <AreaChartOutlined /> 趋势分析
                            </Radio.Button>
                            <Radio.Button value="distribution">
                                <PieChartOutlined /> 害虫分布
                            </Radio.Button>
                            <Radio.Button value="confidence">
                                <BarChartOutlined /> 置信度分析
                            </Radio.Button>
                            <Radio.Button value="accuracy">
                                <CheckCircleOutlined /> 精确度分析
                            </Radio.Button>
                            <Radio.Button value="spatial">
                                <AreaChartOutlined /> 空间分布
                            </Radio.Button>
                            <Radio.Button value="prediction">
                                <LineChartOutlined /> 趋势预测
                            </Radio.Button>
                            <Radio.Button value="comparison">
                                <SwapOutlined /> 环比分析
                            </Radio.Button>
                        </Radio.Group>
                    </Col>
                    <Col>
                        <RangePicker
                            value={dateRange}
                            onChange={handleDateRangeChange}
                            allowClear={false}
                        />
                    </Col>
                </Row>
            </Card>

            <div style={{ marginTop: 16 }}>
                {loading ? (
                    <Card>
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <Spin size="large" />
                        </div>
                    </Card>
                ) : (
                    <>
                        {/* 统计概览 */}
                        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                            <Col xs={24} sm={8}>
                                <Card>
                                    <Statistic
                                        title="总检测数"
                                        value={
                                            statisticsData?.totalDetections || 0
                                        }
                                        prefix={<BugOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Card>
                                    <Statistic
                                        title="害虫类型数"
                                        value={
                                            statisticsData?.uniquePestTypes || 0
                                        }
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Card>
                                    <Statistic
                                        title="平均置信度"
                                        value={
                                            (statisticsData?.averageConfidence ||
                                                0) * 100
                                        }
                                        precision={2}
                                        suffix="%"
                                    />
                                </Card>
                            </Col>
                        </Row>

                        {/* 图表展示区域 */}
                        <Card>
                            {chartType === 'trend' &&
                                (statisticsData?.trendData?.length ? (
                                    <TrendChart
                                        data={statisticsData.trendData}
                                    />
                                ) : (
                                    <Empty description="暂无趋势数据" />
                                ))}

                            {chartType === 'distribution' &&
                                (statisticsData?.pestDistribution?.length ? (
                                    <DistributionChart
                                        data={statisticsData.pestDistribution}
                                    />
                                ) : (
                                    <Empty description="暂无分布数据" />
                                ))}

                            {chartType === 'confidence' &&
                                (statisticsData?.confidenceData?.length ? (
                                    <ConfidenceChart
                                        data={statisticsData.confidenceData}
                                    />
                                ) : (
                                    <Empty description="暂无置信度数据" />
                                ))}

                            {chartType === 'accuracy' && statisticsData && (
                                <AccuracyAnalysis
                                    confidenceData={
                                        statisticsData.confidenceData
                                    }
                                    pestTypes={statisticsData.pestDistribution.map(
                                        (item) => ({
                                            name: item.name,
                                            avgConfidence:
                                                calculateAvgConfidence(
                                                    item.name
                                                ),
                                        })
                                    )}
                                />
                            )}

                            {chartType === 'spatial' && statisticsData && (
                                <SpatialDistribution
                                    locationData={generateSpatialData()}
                                    pestTypes={statisticsData.pestDistribution.map(
                                        (item) => item.name
                                    )}
                                />
                            )}

                            {chartType === 'prediction' &&
                                statisticsData &&
                                statisticsData.trendData &&
                                statisticsData.trendData.length > 0 && (
                                    <PredictionAnalysis
                                        historicalData={
                                            statisticsData.trendData
                                        }
                                    />
                                )}

                            {chartType === 'comparison' && statisticsData && (
                                <ComparisonAnalysis
                                    currentData={{
                                        total: statisticsData.totalDetections,
                                        byType: statisticsData.pestDistribution.map(
                                            (item) => ({
                                                name: item.name,
                                                count: item.value, // 将value映射为count
                                            })
                                        ),
                                    }}
                                    previousData={{
                                        total:
                                            comparisonData?.previous
                                                ?.totalDetections || 0,
                                        byType: (
                                            comparisonData?.previous
                                                ?.pestDistribution || []
                                        ).map((item) => ({
                                            name: item.name,
                                            count: item.value, // 将value映射为count
                                        })),
                                    }}
                                />
                            )}
                        </Card>

                        {/* 大模型分析区域 */}
                        <Card title="智能分析报告" style={{ marginTop: 16 }}>
                            <Empty
                                description={
                                    <span>
                                        大模型分析功能正在开发中，敬请期待！
                                        <br />
                                        未来将提供基于检测结果的害虫发生趋势分析、防治建议等内容。
                                    </span>
                                }
                            />
                        </Card>
                    </>
                )}
            </div>
        </PageLayout>
    )
}

export default Statistics
