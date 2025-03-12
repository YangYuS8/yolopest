import React from 'react'
import { Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

interface LoadingDisplayProps {
    message?: string
}

const LoadingDisplay: React.FC<LoadingDisplayProps> = ({
    message = '加载中...',
}) => {
    return (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin
                indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
            />
            <p style={{ marginTop: 16 }}>{message}</p>
        </div>
    )
}

export default LoadingDisplay
