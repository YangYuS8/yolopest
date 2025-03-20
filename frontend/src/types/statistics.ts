export interface StatisticsDataType {
    pestDistribution: Array<{ name: string; value: number }>
    confidenceData: number[]
    trendData: Array<{ date: string; count: number }>
    totalDetections: number
    uniquePestTypes: number
    averageConfidence: number
}

export interface PestTypeWithConfidence {
    name: string
    avgConfidence: number
}

export interface ComparisonDataType {
    previous: StatisticsDataType | null
}

export interface SpatialDataPoint {
    x: number
    y: number
    type: string
    value: number
}
