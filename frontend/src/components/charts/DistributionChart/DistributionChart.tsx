import React from 'react'
import {
    PieChart,
    Pie,
    Cell,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts'
import { Card } from 'antd'
import { BaseChartContainer } from '../BaseChartContainer/BaseChartContainer'
import { ChartTheme } from '../../../utils/chartTheme'

interface DistributionChartProps {
    data: {
        name: string
        value: number
    }[]
}

export const DistributionChart: React.FC<DistributionChartProps> = ({
    data,
}) => {
    // 计算总数以便获取百分比
    const total = data.reduce((sum, item) => sum + item.value, 0)

    // 格式化数据，预计算百分比
    const chartData = data.map((item) => ({
        name: item.name,
        value: item.value,
        percent: total > 0 ? item.value / total : 0,
    }))

    return (
        <Card>
            <BaseChartContainer
                title="害虫类型分布"
                tooltip="查看各类型害虫的分布情况"
                containerSelector=".distribution-chart-container"
                fileNamePrefix="害虫类型分布"
            >
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) =>
                                `${name}: ${(percent * 100).toFixed(1)}%`
                            }
                            labelLine={true}
                            isAnimationActive={true}
                            animationBegin={0}
                            animationDuration={1200}
                            animationEasing="ease-out"
                        >
                            {chartData.map((_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        ChartTheme.colors.primary[
                                            index %
                                                ChartTheme.colors.primary.length
                                        ]
                                    }
                                />
                            ))}
                        </Pie>
                        <Legend
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                        />
                        <RechartsTooltip
                            formatter={(value, name, props) => {
                                const percent = (
                                    props.payload.percent * 100
                                ).toFixed(1)
                                return [`${value} (${percent}%)`, name]
                            }}
                            contentStyle={ChartTheme.tooltipStyle}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </BaseChartContainer>

            <div style={{ textAlign: 'center', marginTop: 10 }}>
                <div style={{ fontSize: '16px' }}>害虫种类</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {chartData.length}
                </div>
            </div>
        </Card>
    )
}
