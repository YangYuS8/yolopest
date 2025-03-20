import React from 'react'
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts'
import { Card, Select, Empty } from 'antd'

interface SpatialDistributionProps {
    locationData: Array<{
        x: number
        y: number
        type: string
        value: number
    }>
    pestTypes: string[]
}

export const SpatialDistribution: React.FC<SpatialDistributionProps> = ({
    locationData,
    pestTypes,
}) => {
    const [selectedPest, setSelectedPest] = React.useState<string>('all')

    const filteredData = React.useMemo(() => {
        if (selectedPest === 'all') return locationData
        return locationData.filter((item) => item.type === selectedPest)
    }, [locationData, selectedPest])

    // 生成不同类型的颜色映射
    const colorMap = React.useMemo(() => {
        const colors = [
            '#174c83',
            '#7eb6d4',
            '#efa759',
            '#9b4d16',
            '#1890ff',
            '#52c41a',
            '#faad14',
            '#f5222d',
            '#722ed1',
            '#13c2c2',
        ]
        const map = new Map<string, string>()

        pestTypes.forEach((type, index) => {
            map.set(type, colors[index % colors.length])
        })

        return map
    }, [pestTypes])

    // 为不同类型的害虫创建数据系列
    const seriesData = React.useMemo(() => {
        if (selectedPest === 'all') {
            // 按类型分组
            const groupedData = pestTypes.map((type) => ({
                name: type,
                data: locationData.filter((item) => item.type === type),
                fill: colorMap.get(type) || '#174c83',
            }))
            return groupedData
        } else {
            // 只返回选中的类型
            return [
                {
                    name: selectedPest,
                    data: filteredData,
                    fill: colorMap.get(selectedPest) || '#174c83',
                },
            ]
        }
    }, [selectedPest, filteredData, pestTypes, locationData, colorMap])

    if (locationData.length === 0) {
        return <Empty description="暂无空间分布数据" />
    }

    return (
        <Card
            title="害虫空间分布"
            extra={
                <Select
                    style={{ width: 200 }}
                    value={selectedPest}
                    onChange={(value) => setSelectedPest(value)}
                    options={[
                        { value: 'all', label: '全部害虫' },
                        ...pestTypes.map((type) => ({
                            value: type,
                            label: type,
                        })),
                    ]}
                />
            }
        >
            <div style={{ width: '100%', height: 500 }}>
                <ResponsiveContainer>
                    <ScatterChart
                        margin={{
                            top: 20,
                            right: 30,
                            bottom: 20,
                            left: 20,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            type="number"
                            dataKey="x"
                            name="X坐标"
                            domain={[0, 1]}
                            label={{
                                value: 'X 位置',
                                position: 'insideBottom',
                                offset: -10,
                            }}
                        />
                        <YAxis
                            type="number"
                            dataKey="y"
                            name="Y坐标"
                            domain={[0, 1]}
                            label={{
                                value: 'Y 位置',
                                angle: -90,
                                position: 'insideLeft',
                            }}
                        />
                        <ZAxis
                            type="number"
                            dataKey="value"
                            range={[30, 300]}
                            name="数量"
                        />
                        <RechartsTooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            formatter={(value, name) => {
                                // 检查 value 是否为数字，然后才调用 toFixed
                                if (name === 'value') {
                                    const numValue =
                                        typeof value === 'number'
                                            ? value
                                            : parseFloat(value as string)
                                    return [`${numValue.toFixed(1)}`, '密度值']
                                }

                                if (typeof value === 'number') {
                                    return [value.toFixed(2), name]
                                }

                                return [value, name]
                            }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload
                                    return (
                                        <div
                                            style={{
                                                backgroundColor: '#fff',
                                                padding: '10px',
                                                border: '1px solid #ccc',
                                                borderRadius: '5px',
                                            }}
                                        >
                                            <p>{`害虫类型: ${data.type}`}</p>
                                            <p>{`密度值: ${data.value.toFixed(1)}`}</p>
                                            <p>{`位置: (${data.x.toFixed(2)}, ${data.y.toFixed(2)})`}</p>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />
                        <Legend />
                        {seriesData.map((series) => (
                            <Scatter
                                key={series.name}
                                name={series.name}
                                data={series.data}
                                fill={series.fill}
                            />
                        ))}
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </Card>
    )
}
