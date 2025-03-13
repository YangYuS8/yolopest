import React from 'react'
import { Card } from 'antd'

interface CardContainerProps {
    title: string
    children: React.ReactNode
    extra?: React.ReactNode
    loading?: boolean
}

const CardContainer: React.FC<CardContainerProps> = ({
    title,
    children,
    extra,
    loading = false,
}) => {
    return (
        <Card
            title={title}
            extra={extra}
            loading={loading}
            className="yolopest-card"
        >
            {children}
        </Card>
    )
}

export default CardContainer
