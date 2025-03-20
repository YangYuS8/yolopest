import { useState, useCallback, useEffect } from 'react'
import dayjs from 'dayjs'
import { HistoryRecord } from '../../../types/history'
import { StatisticsDataType } from '../../../types/statistics'

export const useStatisticsData = (
    records: HistoryRecord[],
    dateRange: [dayjs.Dayjs, dayjs.Dayjs]
) => {
    const [loading, setLoading] = useState<boolean>(true)
    const [statisticsData, setStatisticsData] =
        useState<StatisticsDataType | null>(null)

    const processStatisticsData = useCallback(
        (records: HistoryRecord[]): StatisticsDataType => {
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
        },
        []
    )

    const fetchData = useCallback(async () => {
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
    }, [dateRange, records, processStatisticsData])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // 计算每种害虫的平均置信度
    const calculateAvgConfidence = useCallback(
        (pestName: string): number => {
            if (!statisticsData) return 0

            let total = 0
            let count = 0

            records.forEach((record) => {
                if (record.type === 'image' && record.result.predictions) {
                    record.result.predictions.forEach((pred) => {
                        const type =
                            pred.class ||
                            (pred as { pest?: string }).pest ||
                            '未知'
                        if (type === pestName) {
                            total += pred.confidence
                            count++
                        }
                    })
                }
            })

            return count > 0 ? total / count : 0
        },
        [records, statisticsData]
    )

    return {
        loading,
        statisticsData,
        calculateAvgConfidence,
        fetchData,
        processStatisticsData, // 添加这一行
    }
}
