import React, { useMemo } from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    Cell,
    Legend,
} from 'recharts'
import { Space, Tooltip } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import { ChartDownloadButton } from '../../common/ChartDownloadButton/ChartDownloadButton'

interface ConfidenceChartProps {
    data: number[]
}

export const ConfidenceChart: React.FC<ConfidenceChartProps> = ({ data }) => {
    // 处理数据为区间分布
    const chartData = useMemo(() => {
        const intervals = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
        const counts = Array(intervals.length - 1).fill(0)

        data.forEach((confidence) => {
            for (let i = 0; i < intervals.length - 1; i++) {
                if (
                    confidence >= intervals[i] &&
                    confidence < intervals[i + 1]
                ) {
                    counts[i]++
                    break
                }
                // 特殊处理1.0的情况
                if (confidence === 1.0 && i === intervals.length - 2) {
                    counts[i]++
                }
            }
        })

        return counts.map((count, index) => ({
            range: `${(intervals[index] * 100).toFixed(0)}-${(intervals[index + 1] * 100).toFixed(0)}%`,
            count: count,
            confidence: intervals[index],
        }))
    }, [data])

    // 优化大数据处理
    const optimizedChartData = useMemo(() => {
        // 如果数据量过大，将多个区间合并
        if (chartData.length > 20) {
            // 合并处理逻辑...
            return mergedData
        }
        return chartData
    }, [chartData])

    // 生成颜色
    const getBarColor = (confidence: number) => {
        return `rgba(82, 196, ${30 + confidence * 225}, 0.85)`
    }

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20,
                }}
            >
                <h3 style={{ margin: 0 }}>检测置信度分布</h3>
                <Space>
                    <Tooltip title="查看不同置信度区间的检测数量分布">
                        <InfoCircleOutlined />
                    </Tooltip>
                    <ChartDownloadButton
                        containerSelector=".confidence-chart-container"
                        fileNamePrefix="置信度分布"
                    />
                </Space>
            </div>

            <div
                className="confidence-chart-container"
                style={{ width: '100%', height: 400 }}
            >
                <ResponsiveContainer>
                    <BarChart
                        data={optimizedChartData}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 30,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="range"
                            label={{
                                value: '置信度区间',
                                position: 'insideBottomRight',
                                offset: -10,
                            }}
                        />
                        <YAxis
                            label={{
                                value: '检测数量',
                                angle: -90,
                                position: 'insideLeft',
                            }}
                        />
                        <RechartsTooltip
                            formatter={(value) => [`${value} 个`, '检测数量']}
                            labelFormatter={(label) => `置信度区间: ${label}`}
                        />
                        <Legend />
                        <Bar
                            dataKey="count"
                            name="检测数量"
                            radius={[8, 8, 0, 0]}
                        >
                            {optimizedChartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={getBarColor(entry.confidence)}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
