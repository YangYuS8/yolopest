import React, { useMemo } from 'react'
import { Column } from '@ant-design/charts'

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

    const config = {
        data: chartData,
        xField: 'range',
        yField: 'count',
        label: {
            // position: 'middle',
            style: {
                fill: '#FFFFFF',
                opacity: 0.8,
            },
        },
        meta: {
            range: {
                alias: '置信度区间',
            },
            count: {
                alias: '检测数量',
            },
        },
        xAxis: {
            title: {
                text: '置信度区间',
            },
        },
        yAxis: {
            title: {
                text: '检测数量',
            },
        },
        tooltip: {
            // 修复类型问题
            formatter: (datum: {
                range: string
                count: number
                confidence: number
            }) => {
                return `置信度区间: ${datum.range}<br>检测数量: ${datum.count}`
            },
        },
        color: ({ confidence }: { confidence: number }) => {
            // 根据置信度生成渐变色
            return `rgba(82, 196, ${30 + confidence * 225}, 0.85)`
        },
        columnStyle: {
            radius: [8, 8, 0, 0],
        },
    }

    return (
        <div>
            <h3 style={{ textAlign: 'center', marginBottom: 20 }}>
                检测置信度分布
            </h3>
            <Column {...config} height={400} />
        </div>
    )
}
