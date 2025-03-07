import React, { ReactNode } from 'react'
import { Card, Empty } from 'antd'

interface ResultCardProps {
    title: string
    loading?: boolean
    loadingContent?: ReactNode
    isEmpty?: boolean
    emptyText?: string
    extra?: ReactNode
    children: ReactNode
}

const ResultCard: React.FC<ResultCardProps> = ({
    title,
    loading = false,
    loadingContent,
    isEmpty = false,
    emptyText = '暂无数据',
    extra,
    children,
}) => {
    if (loading && loadingContent) {
        return <Card title={title}>{loadingContent}</Card>
    }

    if (isEmpty) {
        return (
            <Card title={title}>
                <Empty description={emptyText} />
            </Card>
        )
    }

    return (
        <Card title={title} extra={extra}>
            {children}
        </Card>
    )
}

export default ResultCard
