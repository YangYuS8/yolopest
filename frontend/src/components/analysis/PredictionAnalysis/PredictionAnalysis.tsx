import React from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts'
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
        const n = recentData.length

        for (let i = 0; i < n; i++) {
            sumX += i
            sumY += recentData[i].count
            sumXY += i * recentData[i].count
            sumX2 += i * i
        }

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
        const intercept = (sumY - slope * sumX) / n

        const predictions = []
        const lastDate = new Date(recentData[n - 1].date)

        // 生成未来days天的预测
        for (let i = 1; i <= days; i++) {
            const predictionDate = new Date(lastDate)
            predictionDate.setDate(predictionDate.getDate() + i)
            const dateStr = predictionDate.toISOString().split('T')[0]

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
                <ResponsiveContainer>
                    <LineChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 30,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            label={{
                                value: '日期',
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
                            formatter={(value, name) => [
                                `${value} 个`,
                                name === '实际值' ? '实际检测数' : '预测检测数',
                            ]}
                            labelFormatter={(label) => `日期: ${label}`}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="count"
                            name="实际值"
                            stroke="#1979C9"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="count"
                            name="预测值"
                            stroke="#D62A0D"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{ r: 4 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    )
}
