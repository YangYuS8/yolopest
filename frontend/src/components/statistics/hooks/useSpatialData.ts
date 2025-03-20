import { useCallback } from 'react'
import { StatisticsDataType, SpatialDataPoint } from '../../../types/statistics'

export const useSpatialData = () => {
    const generateSpatialData = useCallback(
        (statisticsData: StatisticsDataType | null): SpatialDataPoint[] => {
            if (!statisticsData) return []

            return statisticsData.pestDistribution.flatMap(
                (item: { name: string; value: number }) => {
                    const points: SpatialDataPoint[] = []
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
                }
            )
        },
        []
    )

    return { generateSpatialData }
}
