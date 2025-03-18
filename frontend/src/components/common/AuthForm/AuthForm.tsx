import React from 'react'
import { Card, Form, Button, Alert, Typography, Space } from 'antd'
import type { FormInstance } from 'antd/es/form'

const { Title } = Typography

// 使用索引签名类型
export interface AuthFormProps<T extends Record<string, unknown>> {
    title: string
    formName: string
    onFinish: (values: T) => Promise<void>
    loading: boolean
    error: string | null
    children: React.ReactNode
    successMessage?: string | null
    submitText?: string
    footerContent?: React.ReactNode
    form?: FormInstance<T>
}

const AuthForm = <T extends Record<string, unknown>>({
    title,
    formName,
    onFinish,
    loading,
    error,
    children,
    successMessage,
    submitText = '提交',
    footerContent,
    form,
}: AuthFormProps<T>): React.ReactElement => {
    return (
        <div className="auth-form-container">
            <Card bordered={false} className="auth-form-card">
                <Space
                    direction="vertical"
                    size="large"
                    style={{ width: '100%' }}
                >
                    <div className="auth-form-header">
                        <Title level={2}>{title}</Title>
                    </div>

                    {successMessage && (
                        <Alert
                            message={successMessage}
                            type="success"
                            showIcon
                        />
                    )}

                    {error && <Alert message={error} type="error" showIcon />}

                    <Form
                        form={form}
                        name={formName}
                        onFinish={(values) => onFinish(values as T)}
                        layout="vertical"
                        autoComplete="off"
                        requiredMark={false}
                    >
                        {children}

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                block
                                size="large"
                            >
                                {submitText}
                            </Button>
                        </Form.Item>
                    </Form>

                    {footerContent}
                </Space>
            </Card>
        </div>
    )
}

export default AuthForm
