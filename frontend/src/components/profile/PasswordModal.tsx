import React from 'react'
import { Modal, Form, Input, Button } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { FormInstance } from 'antd/es/form'

interface PasswordModalProps {
    visible: boolean
    loading: boolean
    form: FormInstance
    onCancel: () => void
    onSubmit: (values: {
        current_password: string
        new_password: string
    }) => Promise<void>
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
    visible,
    loading,
    form,
    onCancel,
    onSubmit,
}) => {
    return (
        <Modal
            title="修改密码"
            open={visible}
            onCancel={onCancel}
            footer={null}
        >
            <Form form={form} layout="vertical" onFinish={onSubmit}>
                <Form.Item
                    name="current_password"
                    rules={[{ required: true, message: '请输入当前密码' }]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="当前密码"
                    />
                </Form.Item>

                <Form.Item
                    name="new_password"
                    rules={[
                        { required: true, message: '请输入新密码' },
                        { min: 6, message: '密码至少需要6个字符' },
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="新密码"
                    />
                </Form.Item>

                <Form.Item
                    name="confirm_password"
                    dependencies={['new_password']}
                    rules={[
                        { required: true, message: '请确认新密码' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (
                                    !value ||
                                    getFieldValue('new_password') === value
                                ) {
                                    return Promise.resolve()
                                }
                                return Promise.reject(
                                    new Error('两次输入的密码不匹配')
                                )
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="确认新密码"
                    />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        确认修改
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    )
}
