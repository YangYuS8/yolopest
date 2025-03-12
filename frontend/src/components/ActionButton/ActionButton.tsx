import React from 'react'
import { Button } from 'antd'
import { ButtonProps } from 'antd/es/button'

interface ActionButtonProps extends ButtonProps {
    label: string
}

export const ClearButton: React.FC<ActionButtonProps> = ({
    label = '清除结果',
    ...props
}) => {
    return (
        <Button danger {...props}>
            {label}
        </Button>
    )
}

export const SubmitButton: React.FC<ActionButtonProps> = ({
    label = '提交',
    ...props
}) => {
    return (
        <Button type="primary" {...props}>
            {label}
        </Button>
    )
}
