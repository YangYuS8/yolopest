import React, { useState } from 'react'
import { Card, Empty, Spin } from 'antd'
import { PageLayout } from '../components/layout'
import { useHistory } from '../services/historyService'
import dayjs from 'dayjs'
import {
    StatisticsHeader,
    StatisticsSummary,
    StatisticsChartArea,
    useStatisticsData,
    useComparisonData,
    useSpatialData,
} from '../components/statistics'
import type { Dayjs } from 'dayjs'
import type { RangePickerProps } from 'antd/es/date-picker'

const Statistics: React.FC = () => {
    // 基础状态
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
        dayjs().subtract(30, 'days'),
        dayjs(),
    ])
    const [chartType, setChartType] = useState<string>('trend')

    // 获取历史记录
    const { records } = useHistory()

    // 使用自定义钩子获取统计数据
    const {
        loading,
        statisticsData,
        calculateAvgConfidence,
        processStatisticsData,
    } = useStatisticsData(records, dateRange)

    // 获取环比数据
    const { comparisonData } = useComparisonData(
        records,
        dateRange,
        statisticsData,
        processStatisticsData
    )

    // 获取空间数据
    const { generateSpatialData } = useSpatialData()

    // 处理日期变更
    const handleDateRangeChange: RangePickerProps['onChange'] = (dates) => {
        if (dates && dates[0] && dates[1]) {
            setDateRange([dates[0], dates[1]])
        }
    }

    return (
        <PageLayout title="统计分析">
            <StatisticsHeader
                dateRange={dateRange}
                chartType={chartType}
                onDateRangeChange={handleDateRangeChange}
                onChartTypeChange={setChartType}
            />

            <div style={{ marginTop: 16 }}>
                {loading ? (
                    <Card>
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <Spin size="large" />
                        </div>
                    </Card>
                ) : (
                    <>
                        <StatisticsSummary statisticsData={statisticsData} />

                        <StatisticsChartArea
                            chartType={chartType}
                            statisticsData={statisticsData}
                            comparisonData={comparisonData}
                            locationData={generateSpatialData(statisticsData)}
                            pestTypes={
                                statisticsData?.pestDistribution.map(
                                    (item) => item.name
                                ) || []
                            }
                            calculateAvgConfidence={calculateAvgConfidence}
                        />

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
