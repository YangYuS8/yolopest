import React from 'react'
import {
    PieChart,
    Pie,
    Cell,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts'
import { Space, Tooltip, Card } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import { ChartDownloadButton } from '../../common/ChartDownloadButton/ChartDownloadButton'

interface DistributionChartProps {
    data: {
        name: string
        value: number
    }[]
}

// 颜色配置
const COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#8dd1e1',
]

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
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20,
                }}
            >
                <h3 style={{ margin: 0 }}>害虫类型分布</h3>
                <Space>
                    <Tooltip title="查看各类型害虫的分布情况">
                        <InfoCircleOutlined />
                    </Tooltip>
                    <ChartDownloadButton
                        containerSelector=".distribution-chart-container"
                        fileNamePrefix="害虫类型分布"
                    />
                </Space>
            </div>

            <div
                className="distribution-chart-container"
                style={{ width: '100%', height: 400 }}
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
                        >
                            {chartData.map((_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
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
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div style={{ textAlign: 'center', marginTop: 10 }}>
                <div style={{ fontSize: '16px' }}>害虫种类</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {chartData.length}
                </div>
            </div>
        </Card>
    )
}
