// 热力图组件
import React from 'react'
import { Heatmap } from '@ant-design/charts'
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

    const config = {
        data: filteredData,
        xField: 'x',
        yField: 'y',
        colorField: 'value',
        shape: 'circle',
        sizeField: 'value',
        color: ['#174c83', '#7eb6d4', '#efefeb', '#efa759', '#9b4d16'],
        // 添加tooltip配置
        tooltip: {
            formatter: (datum: {
                x: number
                y: number
                type: string
                value: number
            }) => {
                return `类型: ${datum.type}<br>位置: (${(datum.x * 100).toFixed(0)}%, ${(datum.y * 100).toFixed(0)}%)<br>值: ${datum.value.toFixed(2)}`
            },
        },
        meta: {
            x: {
                min: 0,
                max: 1,
            },
            y: {
                min: 0,
                max: 1,
            },
        },
    }

    return (
        <Card
            title="害虫空间分布热力图"
            extra={
                <Select
                    defaultValue="all"
                    style={{ width: 180 }}
                    onChange={(value) => setSelectedPest(value)}
                    options={[
                        { value: 'all', label: '全部害虫类型' },
                        ...pestTypes.map((type) => ({
                            value: type,
                            label: type,
                        })),
                    ]}
                />
            }
        >
            {filteredData.length > 0 ? (
                <div style={{ height: 500 }}>
                    <Heatmap {...config} />
                </div>
            ) : (
                <Empty description="暂无空间分布数据" />
            )}
        </Card>
    )
}
