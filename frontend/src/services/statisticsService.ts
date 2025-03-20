import api from '../utils/axiosConfig'

interface StatisticsParams {
    startTime?: number
    endTime?: number
    [key: string]: number | undefined
}

/**
 * 获取统计数据
 */
export const getStatisticsData = async (
    startTime?: number,
    endTime?: number
) => {
    try {
        const params: StatisticsParams = {}
        if (startTime) params.startTime = startTime
        if (endTime) params.endTime = endTime

        const { data } = await api.get('/statistics', { params })
        return data
    } catch (error) {
        console.error('获取统计数据失败:', error)
        throw error
    }
}
