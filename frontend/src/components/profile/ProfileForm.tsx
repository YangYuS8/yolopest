import React from 'react'
import { Card, Form, Input, Button } from 'antd'
import { UserOutlined, MailOutlined } from '@ant-design/icons'
import { FormInstance } from 'antd/es/form'

interface ProfileFormProps {
    form: FormInstance
    loading: boolean
    onSubmit: (values: { username: string; email: string }) => Promise<void>
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
    form,
    loading,
    onSubmit,
}) => {
    return (
        <Card>
            <Form form={form} layout="vertical" onFinish={onSubmit}>
                <Form.Item
                    name="username"
                    label="用户名"
                    rules={[
                        { required: true, message: '请输入用户名' },
                        { min: 3, message: '用户名至少需要3个字符' },
                    ]}
                >
                    <Input prefix={<UserOutlined />} />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="邮箱"
                    rules={[
                        { required: true, message: '请输入邮箱' },
                        {
                            type: 'email',
                            message: '请输入有效的邮箱地址',
                        },
                    ]}
                >
                    <Input prefix={<MailOutlined />} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        保存修改
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    )
}
