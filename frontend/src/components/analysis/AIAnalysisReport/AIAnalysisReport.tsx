import React, { useState, useEffect, useCallback } from 'react'
import {
    Card,
    Typography,
    Button,
    Space,
    Spin,
    Alert,
    Empty,
    Tag,
    message,
} from 'antd'
import { ReloadOutlined, FileTextOutlined } from '@ant-design/icons'
import ReactMarkdown from 'react-markdown'
import { apiRequest } from '../../../utils/apiUtils'
import {
    StatisticsDataType,
    ComparisonDataType,
} from '../../../types/statistics'
import type { Dayjs } from 'dayjs'

const { Text } = Typography

interface AIAnalysisReportProps {
    statisticsData: StatisticsDataType
    dateRange: [Dayjs, Dayjs]
    comparisonData: ComparisonDataType // 使用项目中已定义的ComparisonDataType
    disabled?: boolean
}

// 修正API响应接口定义
interface AIAnalysisResponse {
    status: string
    analysis?: string
    summary?: string
    error?: string
    message?: string
}

export const AIAnalysisReport: React.FC<AIAnalysisReportProps> = ({
    statisticsData,
    dateRange,
    comparisonData,
    disabled = false,
}) => {
    const [analysis, setAnalysis] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>('')
    const [lastUpdateTime, setLastUpdateTime] = useState<string>('')

    // 格式化数据以适应API请求
    const formatComparisonData = useCallback(() => {
        if (!comparisonData.previous) return null

        return {
            currentData: {
                total: statisticsData.totalDetections,
                byType: statisticsData.pestDistribution.map((item) => ({
                    name: item.name,
                    count: item.value,
                })),
            },
            previousData: {
                total: comparisonData.previous.totalDetections,
                byType: comparisonData.previous.pestDistribution.map(
                    (item) => ({
                        name: item.name,
                        count: item.value,
                    })
                ),
            },
        }
    }, [statisticsData, comparisonData])

    // 修改generateAnalysis函数的响应处理部分
    const generateAnalysis = useCallback(async () => {
        setLoading(true)
        setError('')

        try {
            // 准备请求数据
            const requestData = {
                statisticsData,
                dateRange: dateRange.map((d) => d.format('YYYY-MM-DD')),
                comparisonData: formatComparisonData(),
            }

            // 调用后端API
            const response = await apiRequest<AIAnalysisResponse>({
                url: '/api/ai-analysis/',
                method: 'POST',
                data: requestData,
            })

            // 输出响应进行调试
            console.log('API响应数据:', response)

            // 修正这里：直接检查response.analysis而不是response.data.analysis
            if (response.status === 'success' && response.analysis) {
                setAnalysis(response.analysis)
                setLastUpdateTime(new Date().toLocaleTimeString())
                message.success('分析报告生成成功')
            } else {
                throw new Error(
                    response.error || response.message || '未知错误'
                )
            }
        } catch (err) {
            console.error('获取AI分析报告失败:', err)
            setError((err as Error).message || '生成报告失败，请稍后重试')
            message.error('分析报告生成失败')
        } finally {
            setLoading(false)
        }
    }, [statisticsData, dateRange, formatComparisonData])

    // 将自动触发分析的useEffect修改为：
    useEffect(() => {
        // 不再自动调用API，让用户主动点击按钮生成分析
        // 如需保留自动分析功能，可添加开关控制
    }, [])

    // 导出分析报告为文本文件
    const exportReport = () => {
        // 创建临时文本文件供下载
        const element = document.createElement('a')
        const file = new Blob([analysis], { type: 'text/plain' })
        element.href = URL.createObjectURL(file)
        element.download = `害虫分析报告_${new Date().toISOString().split('T')[0]}.md`
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
    }

    // 渲染分析内容
    const renderAnalysisContent = () => {
        if (loading) {
            return (
                <div style={{ padding: '20px 0', textAlign: 'center' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16 }}>
                        <Text>正在生成智能分析报告，这可能需要几秒钟...</Text>
                    </div>
                </div>
            )
        }

        if (error) {
            return (
                <Alert
                    message="生成报告失败"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button size="small" onClick={generateAnalysis}>
                            重试
                        </Button>
                    }
                />
            )
        }

        if (!analysis) {
            return (
                <Empty
                    description={
                        <span>点击"生成分析报告"按钮获取智能分析结果</span>
                    }
                />
            )
        }

        return (
            <div className="markdown-content">
                <ReactMarkdown>{analysis}</ReactMarkdown>

                {lastUpdateTime && (
                    <div style={{ marginTop: 16, textAlign: 'right' }}>
                        <Text type="secondary">更新于: {lastUpdateTime}</Text>
                    </div>
                )}
            </div>
        )
    }

    return (
        <Card
            title={
                <Space>
                    <span>智能分析报告</span>
                    {!loading && analysis && <Tag color="green">已分析</Tag>}
                </Space>
            }
            extra={
                <Space>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={generateAnalysis}
                        loading={loading}
                        disabled={disabled || loading}
                    >
                        {analysis ? '重新分析' : '生成分析报告'}
                    </Button>
                    {analysis && (
                        <Button
                            icon={<FileTextOutlined />}
                            onClick={exportReport}
                            disabled={loading}
                        >
                            导出报告
                        </Button>
                    )}
                </Space>
            }
            style={{ marginTop: 16 }}
        >
            {renderAnalysisContent()}
        </Card>
    )
}

export default AIAnalysisReport
