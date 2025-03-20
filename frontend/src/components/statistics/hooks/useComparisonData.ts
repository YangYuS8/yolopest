import { useState, useCallback, useEffect } from 'react'
import dayjs from 'dayjs'
import { HistoryRecord } from '../../../types/history'
import { StatisticsDataType } from '../../../types/statistics'

export const useComparisonData = (
    records: HistoryRecord[],
    dateRange: [dayjs.Dayjs, dayjs.Dayjs],
    statisticsData: StatisticsDataType | null,
    processStatisticsData: (records: HistoryRecord[]) => StatisticsDataType
) => {
    const [comparisonData, setComparisonData] = useState<{
        previous: StatisticsDataType | null
    }>({ previous: null })

    const calculateComparisonData = useCallback(() => {
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
    }, [dateRange, records, statisticsData, processStatisticsData])

    useEffect(() => {
        if (statisticsData) {
            calculateComparisonData()
        }
    }, [statisticsData, calculateComparisonData])

    return { comparisonData }
}
