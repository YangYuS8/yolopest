import React from 'react'
import { Alert } from 'antd'

interface ErrorDisplayProps {
    message: string
    description?: string
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
    message,
    description,
}) => {
    return (
        <Alert
            message={message}
            description={description}
            type="error"
            showIcon
        />
    )
}

export default ErrorDisplay
