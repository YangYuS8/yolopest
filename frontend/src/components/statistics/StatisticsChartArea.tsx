import React from 'react'
import { Card, Empty } from 'antd'
import { TrendChart, DistributionChart, ConfidenceChart } from '../charts'
import { AccuracyAnalysis } from '../analysis/AccuracyAnalysis/AccuracyAnalysis'
import { SpatialDistribution } from '../analysis/SpatialDistribution/SpatialDistribution'
import { PredictionAnalysis } from '../analysis/PredictionAnalysis/PredictionAnalysis'
import { ComparisonAnalysis } from '../analysis/ComparisonAnalysis/ComparisonAnalysis'
import { StatisticsDataType, SpatialDataPoint } from '../../types/statistics' // 添加 SpatialDataPoint

interface StatisticsChartAreaProps {
    chartType: string
    statisticsData: StatisticsDataType | null
    comparisonData: { previous: StatisticsDataType | null }
    locationData: SpatialDataPoint[]
    pestTypes: string[]
    calculateAvgConfidence: (pestName: string) => number
}

export const StatisticsChartArea: React.FC<StatisticsChartAreaProps> = ({
    chartType,
    statisticsData,
    comparisonData,
    locationData,
    pestTypes,
    calculateAvgConfidence,
}) => {
    if (!statisticsData) return null

    return (
        <Card>
            {chartType === 'trend' &&
                (statisticsData.trendData?.length ? (
                    <TrendChart data={statisticsData.trendData} />
                ) : (
                    <Empty description="暂无趋势数据" />
                ))}

            {chartType === 'distribution' &&
                (statisticsData.pestDistribution?.length ? (
                    <DistributionChart data={statisticsData.pestDistribution} />
                ) : (
                    <Empty description="暂无分布数据" />
                ))}

            {chartType === 'confidence' &&
                (statisticsData.confidenceData?.length ? (
                    <ConfidenceChart data={statisticsData.confidenceData} />
                ) : (
                    <Empty description="暂无置信度数据" />
                ))}

            {chartType === 'accuracy' && (
                <AccuracyAnalysis
                    confidenceData={statisticsData.confidenceData}
                    pestTypes={statisticsData.pestDistribution.map((item) => ({
                        name: item.name,
                        avgConfidence: calculateAvgConfidence(item.name),
                    }))}
                />
            )}

            {chartType === 'spatial' && (
                <SpatialDistribution
                    locationData={locationData}
                    pestTypes={pestTypes}
                />
            )}

            {chartType === 'prediction' &&
                statisticsData.trendData &&
                statisticsData.trendData.length > 0 && (
                    <PredictionAnalysis
                        historicalData={statisticsData.trendData}
                    />
                )}

            {chartType === 'comparison' && (
                <ComparisonAnalysis
                    currentData={{
                        total: statisticsData.totalDetections,
                        byType: statisticsData.pestDistribution.map((item) => ({
                            name: item.name,
                            count: item.value,
                        })),
                    }}
                    previousData={{
                        total: comparisonData?.previous?.totalDetections || 0,
                        byType: (
                            comparisonData?.previous?.pestDistribution || []
                        ).map((item) => ({
                            name: item.name,
                            count: item.value,
                        })),
                    }}
                />
            )}
        </Card>
    )
}
