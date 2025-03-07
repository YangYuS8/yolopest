import React from 'react'
import { Progress } from 'antd'

interface ProgressIndicatorProps {
    percent: number
    status?: 'normal' | 'exception' | 'active' | 'success'
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
    percent,
    status = 'active',
}) => {
    return <Progress percent={percent} status={status} />
}

export default ProgressIndicator
