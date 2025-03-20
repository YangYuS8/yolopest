import React from 'react'
import { Line } from '@ant-design/charts'

interface TrendChartProps {
    data: {
        date: string
        count: number
    }[]
}

export const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
    const config = {
        data,
        xField: 'date',
        yField: 'count',
        padding: 'auto',
        xAxis: {
            title: {
                text: '日期',
            },
        },
        yAxis: {
            title: {
                text: '检测数量',
            },
        },
        tooltip: {
            formatter: (datum: { date: string; count: number }) => {
                return `日期: ${datum.date}<br>检测数量: ${datum.count}`
            },
        },
        smooth: true,
        lineStyle: {
            lineWidth: 3,
        },
        point: {
            size: 5,
            shape: 'circle',
            style: {
                fill: 'white',
                stroke: '#1890ff',
                lineWidth: 2,
            },
        },
        area: {
            style: {
                fill: 'l(270) 0:#1890ff1a 1:#1890ff66',
            },
        },
        meta: {
            count: {
                alias: '检测数量',
            },
            date: {
                alias: '日期',
            },
        },
        color: '#1890ff',
    }

    return (
        <div>
            <h3 style={{ textAlign: 'center', marginBottom: 20 }}>
                害虫检测趋势分析
            </h3>
            <Line {...config} height={400} />
        </div>
    )
}
