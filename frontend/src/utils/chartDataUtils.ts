/**
 * 图表数据处理工具
 */

/**
 * 对大数据集进行采样，减少渲染点数
 */
export const sampleData = <T extends Record<string, unknown>>(
    data: T[],
    maxPoints: number = 60,
    valueField: string = 'value'
): T[] => {
    if (data.length <= maxPoints) return data

    const samplingRate = Math.ceil(data.length / maxPoints)
    const result: T[] = []

    for (let i = 0; i < data.length; i += samplingRate) {
        const chunk = data.slice(i, Math.min(i + samplingRate, data.length))

        // 如果数据点有数值，计算平均值
        if (valueField in chunk[0]) {
            const sum = chunk.reduce((acc, item) => {
                const val = item[valueField]
                return acc + (typeof val === 'number' ? val : 0)
            }, 0)
            const avgValue = Math.round(sum / chunk.length)

            // 创建新的数据点，使用类型断言解决索引写入问题
            const newPoint = { ...chunk[0] }
            ;(newPoint as Record<string, unknown>)[valueField] = avgValue
            result.push(newPoint)
        } else {
            // 如果没有数值字段，直接使用第一个点
            result.push(chunk[0])
        }
    }

    return result
}

/**
 * 计算数据统计信息
 */
export const calculateStatistics = <T extends Record<string, unknown>>(
    data: T[],
    valueField: string = 'value'
): { total: number; avg: number; max: T | null } => {
    if (!data.length) return { total: 0, avg: 0, max: null }

    const total = data.reduce((sum, item) => {
        const val = item[valueField]
        return sum + (typeof val === 'number' ? val : 0)
    }, 0)

    const avg = total / data.length

    const max = data.reduce((max, item) => {
        const currentVal = item[valueField]
        const maxVal = max[valueField]

        if (
            typeof currentVal === 'number' &&
            typeof maxVal === 'number' &&
            currentVal > maxVal
        ) {
            return item
        }
        return max
    }, data[0])

    return { total, avg, max }
}

/**
 * 计算环比变化
 */
export const calculateTrend = <T extends Record<string, unknown>>(
    recentData: T[],
    previousData: T[],
    valueField: string = 'value'
): number => {
    const recentAvg = recentData.length
        ? recentData.reduce((sum, item) => {
              const val = item[valueField]
              return sum + (typeof val === 'number' ? val : 0)
          }, 0) / recentData.length
        : 0

    const previousAvg = previousData.length
        ? previousData.reduce((sum, item) => {
              const val = item[valueField]
              return sum + (typeof val === 'number' ? val : 0)
          }, 0) / previousData.length
        : 0

    return previousAvg !== 0
        ? ((recentAvg - previousAvg) / previousAvg) * 100
        : 0
}
