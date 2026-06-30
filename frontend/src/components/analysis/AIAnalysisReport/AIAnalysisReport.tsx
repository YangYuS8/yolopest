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
<<<<<<< HEAD
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
=======
>>>>>>> origin_main
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

<<<<<<< HEAD
            // 调用后端API（api 实例 baseURL 已包含 /api 前缀）
            const response = await apiRequest<AIAnalysisResponse>({
                url: '/ai-analysis/',
=======
            // 调用后端API
            const response = await apiRequest<AIAnalysisResponse>({
                url: '/api/ai-analysis/',
>>>>>>> origin_main
                method: 'POST',
                data: requestData,
            })

            // 输出响应进行调试
            console.log('API响应数据:', response)

<<<<<<< HEAD
            // 后端返回结构: { status: 'success', analysis: '...' }
            if (response.status === 'success' && response.analysis) {
                const analysisData = response.analysis
=======
            // 修正这里：直接检查response.analysis而不是response.data.analysis
            if (
                response.status === 'success' &&
                response.data &&
                response.data.analysis
            ) {
                const analysisData = response.data.analysis
>>>>>>> origin_main
                setAnalysis(analysisData)
                // 保存到localStorage
                localStorage.setItem('aiAnalysisReport', analysisData)
                localStorage.setItem(
                    'aiAnalysisTimestamp',
                    new Date().toISOString()
                )
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
        // 检查是否有已保存的报告
        const savedReport = localStorage.getItem('aiAnalysisReport')
        const timestamp = localStorage.getItem('aiAnalysisTimestamp')

        if (savedReport && timestamp) {
            setAnalysis(savedReport)
            setLastUpdateTime(new Date(timestamp).toLocaleTimeString())
        }
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
<<<<<<< HEAD
            <div className="markdown-content" style={markdownStyles.container}>
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                        h1: ({ children }) => (
                            <h1 style={markdownStyles.h1}>{children}</h1>
                        ),
                        h2: ({ children }) => (
                            <h2 style={markdownStyles.h2}>{children}</h2>
                        ),
                        h3: ({ children }) => (
                            <h3 style={markdownStyles.h3}>{children}</h3>
                        ),
                        p: ({ children }) => (
                            <p style={markdownStyles.p}>{children}</p>
                        ),
                        ul: ({ children }) => (
                            <ul style={markdownStyles.ul}>{children}</ul>
                        ),
                        ol: ({ children }) => (
                            <ol style={markdownStyles.ol}>{children}</ol>
                        ),
                        li: ({ children }) => (
                            <li style={markdownStyles.li}>{children}</li>
                        ),
                        table: ({ children }) => (
                            <div style={markdownStyles.tableWrapper}>
                                <table style={markdownStyles.table}>{children}</table>
                            </div>
                        ),
                        thead: ({ children }) => (
                            <thead style={markdownStyles.thead}>{children}</thead>
                        ),
                        th: ({ children }) => (
                            <th style={markdownStyles.th}>{children}</th>
                        ),
                        td: ({ children }) => (
                            <td style={markdownStyles.td}>{children}</td>
                        ),
                        strong: ({ children }) => (
                            <strong style={markdownStyles.strong}>{children}</strong>
                        ),
                        hr: () => <hr style={markdownStyles.hr} />,
                    }}
                >
                    {analysis}
                </ReactMarkdown>

                {lastUpdateTime && (
                    <div style={{ marginTop: 24, textAlign: 'right' }}>
=======
            <div className="markdown-content">
                <ReactMarkdown>{analysis}</ReactMarkdown>

                {lastUpdateTime && (
                    <div style={{ marginTop: 16, textAlign: 'right' }}>
>>>>>>> origin_main
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

<<<<<<< HEAD
// Markdown 渲染样式：实验室报告 / 档案卡片风格
const markdownStyles: Record<string, React.CSSProperties> = {
    container: {
        lineHeight: 1.8,
        color: '#1f2937',
    },
    h1: {
        fontSize: 22,
        fontWeight: 700,
        color: '#111827',
        margin: '24px 0 16px',
        paddingBottom: 8,
        borderBottom: '2px solid #10b981',
    },
    h2: {
        fontSize: 18,
        fontWeight: 700,
        color: '#1f2937',
        margin: '22px 0 12px',
        paddingLeft: 10,
        borderLeft: '4px solid #10b981',
    },
    h3: {
        fontSize: 16,
        fontWeight: 600,
        color: '#374151',
        margin: '18px 0 10px',
    },
    p: {
        margin: '10px 0',
        color: '#4b5563',
    },
    ul: {
        paddingLeft: 22,
        margin: '10px 0',
    },
    ol: {
        paddingLeft: 22,
        margin: '10px 0',
    },
    li: {
        margin: '6px 0',
        color: '#4b5563',
    },
    tableWrapper: {
        overflowX: 'auto',
        margin: '16px 0',
        borderRadius: 10,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 14,
        background: '#fff',
    },
    thead: {
        background: '#ecfdf5',
    },
    th: {
        padding: '12px 14px',
        textAlign: 'left',
        fontWeight: 600,
        color: '#065f46',
        borderBottom: '2px solid #10b981',
        whiteSpace: 'nowrap',
    },
    td: {
        padding: '12px 14px',
        borderBottom: '1px solid #e5e7eb',
        color: '#374151',
        verticalAlign: 'top',
    },
    strong: {
        color: '#047857',
        fontWeight: 600,
    },
    hr: {
        border: 0,
        height: 1,
        background: '#e5e7eb',
        margin: '24px 0',
    },
}

=======
>>>>>>> origin_main
export default AIAnalysisReport
