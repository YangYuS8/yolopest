// 预测分析组件
import React from 'react'
import { Line } from '@ant-design/charts'
import { Card, Switch, Tooltip, Button, Space } from 'antd'
import { InfoCircleOutlined, DownloadOutlined } from '@ant-design/icons'

interface PredictionAnalysisProps {
    historicalData: Array<{ date: string; count: number }>
    days?: number // 预测天数
}

export const PredictionAnalysis: React.FC<PredictionAnalysisProps> = ({
    historicalData,
    days = 14, // 默认预测两周
}) => {
    const [showPrediction, setShowPrediction] = React.useState<boolean>(true)

    // 简单线性回归预测
    const predictedData = React.useMemo(() => {
        if (historicalData.length < 7) return []

        // 使用最近30天的数据进行预测
        const recentData = historicalData.slice(-30)

        // 计算简单线性回归参数
        let sumX = 0,
            sumY = 0,
            sumXY = 0,
            sumX2 = 0
        recentData.forEach((item, index) => {
            sumX += index
            sumY += item.count
            sumXY += index * item.count
            sumX2 += index * index
        })

        const n = recentData.length
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
        const intercept = (sumY - slope * sumX) / n

        // 预测未来days天
        const lastDate = new Date(recentData[recentData.length - 1].date)
        const predictions = []

        for (let i = 1; i <= days; i++) {
            const nextDate = new Date(lastDate)
            nextDate.setDate(lastDate.getDate() + i)
            const dateStr = nextDate.toISOString().split('T')[0]
            const predictedCount = Math.max(
                0,
                Math.round(intercept + slope * (n + i - 1))
            )

            predictions.push({
                date: dateStr,
                count: predictedCount,
                type: '预测值',
            })
        }

        return predictions
    }, [historicalData, days])

    // 整合历史数据和预测数据
    const chartData = React.useMemo(() => {
        const historical = historicalData.map((item) => ({
            ...item,
            type: '实际值',
        }))

        return showPrediction ? [...historical, ...predictedData] : historical
    }, [historicalData, predictedData, showPrediction])

    const config = {
        data: chartData,
        xField: 'date',
        yField: 'count',
        seriesField: 'type',
        smooth: true,
        animation: {
            appear: {
                animation: 'path-in',
                duration: 1000,
            },
        },
        // 添加正确的tooltip配置
        tooltip: {
            formatter: (datum: {
                date: string
                count: number
                type: string
            }) => {
                return `日期: ${datum.date}<br>${datum.type}: ${datum.count}`
            },
        },
        lineStyle: ({ type }: { type: string }) => {
            if (type === '预测值') {
                return {
                    lineDash: [4, 4],
                    opacity: 0.7,
                }
            }
            return {
                opacity: 0.7,
            }
        },
        color: ['#1979C9', '#D62A0D'],
        point: {
            size: 5,
            shape: 'circle',
        },
    }

    return (
        <Card
            title="害虫趋势预测分析"
            extra={
                <Space>
                    <Tooltip title="基于历史数据预测未来趋势，使用线性回归算法">
                        <InfoCircleOutlined />
                    </Tooltip>
                    <Switch
                        checkedChildren="显示预测"
                        unCheckedChildren="隐藏预测"
                        checked={showPrediction}
                        onChange={setShowPrediction}
                    />
                    <Button
                        icon={<DownloadOutlined />}
                        size="small"
                        onClick={() => {
                            const csvContent =
                                'data:text/csv;charset=utf-8,' +
                                '日期,检测数,类型\n' +
                                chartData
                                    .map(
                                        (row) =>
                                            `${row.date},${row.count},${row.type}`
                                    )
                                    .join('\n')
                            const encodedUri = encodeURI(csvContent)
                            const link = document.createElement('a')
                            link.setAttribute('href', encodedUri)
                            link.setAttribute(
                                'download',
                                `害虫趋势预测_${new Date().toISOString().split('T')[0]}.csv`
                            )
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                        }}
                    >
                        导出数据
                    </Button>
                </Space>
            }
        >
            <div style={{ height: 400 }}>
                <Line {...config} />
            </div>
        </Card>
    )
}
