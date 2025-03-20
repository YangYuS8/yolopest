import React from 'react'
import { Pie } from '@ant-design/charts'

interface DistributionChartProps {
    data: {
        name: string
        value: number
    }[]
}

// 改进类型定义，避免使用any
interface PieItem {
    type: string
    value: number
    // 可能包含的其他字段
    percent?: number
    _origin?: unknown
}

export const DistributionChart: React.FC<DistributionChartProps> = ({
    data,
}) => {
    // 格式化数据以匹配Pie组件要求
    const chartData = data.map((item) => ({
        type: item.name,
        value: item.value,
    }))

    const config = {
        data: chartData,
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        innerRadius: 0.5,
        label: {
            // 添加安全检查防止undefined引发错误
            formatter: (item: PieItem | undefined) => {
                // 安全检查
                if (!item || item.value === undefined) return ''

                // 计算百分比
                const sum = chartData.reduce((acc, curr) => acc + curr.value, 0)
                const percent = sum > 0 ? (item.value / sum) * 100 : 0
                return `${item.type || ''}: ${percent.toFixed(1)}%`
            },
            style: {
                fontSize: 12,
                textAlign: 'center',
                fill: '#000000',
                fontWeight: 500,
            },
            offset: 15,
        },
        legend: {
            layout: 'horizontal',
            position: 'bottom',
        },
        tooltip: {
            formatter: (datum: PieItem | undefined) => {
                if (!datum || datum.value === undefined)
                    return { name: '未知', value: 0 }

                const sum = chartData.reduce((acc, curr) => acc + curr.value, 0)
                const percent = sum > 0 ? (datum.value / sum) * 100 : 0
                return {
                    name: datum.type || '',
                    value: `${datum.value} (${percent.toFixed(1)}%)`,
                }
            },
        },
        interactions: [{ type: 'element-active' }],
    }

    return (
        <div>
            <h3 style={{ textAlign: 'center', marginBottom: 20 }}>
                害虫类型分布
            </h3>
            <Pie {...config} height={400} />
        </div>
    )
}
