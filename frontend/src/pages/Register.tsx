import React from 'react'
import { Input, Form } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import AuthForm from '../components/common/AuthForm/AuthForm'
import { useAuthForm } from '../hooks/useAuthForm'
import { register } from '../services/authService'

// 注册表单类型
interface RegisterFormValues {
    email: string
    username: string
    password: string
    confirm: string
    [key: string]: unknown // 添加索引签名
}

const Register = (): React.ReactElement => {
    const { loading, error, handleSubmit } = useAuthForm('/login')

    const onFinish = async (values: RegisterFormValues): Promise<void> => {
        await handleSubmit<RegisterFormValues>(
            (vals) => register(vals.email, vals.password, vals.username),
            values,
            '注册成功，请登录'
        )
    }

    return (
        <AuthForm<RegisterFormValues>
            title="注册账号"
            formName="register"
            onFinish={onFinish}
            loading={loading}
            error={error}
            submitText="注册"
            footerContent={
                <div style={{ textAlign: 'center' }}>
                    <Link to="/login">已有账号？点击登录</Link>
                </div>
            }
        >
            <Form.Item
                name="email"
                rules={[
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '请输入有效的邮箱地址' },
                ]}
            >
                <Input
                    prefix={<MailOutlined />}
                    placeholder="邮箱"
                    size="large"
                />
            </Form.Item>

            <Form.Item
                name="username"
                rules={[
                    { required: true, message: '请输入用户名' },
                    { min: 3, message: '用户名至少3个字符' },
                ]}
            >
                <Input
                    prefix={<UserOutlined />}
                    placeholder="用户名"
                    size="large"
                />
            </Form.Item>

            <Form.Item
                name="password"
                rules={[
                    { required: true, message: '请输入密码' },
                    { min: 8, message: '密码至少8个字符' },
                ]}
            >
                <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="密码"
                    size="large"
                />
            </Form.Item>

            <Form.Item
                name="confirm"
                dependencies={['password']}
                rules={[
                    { required: true, message: '请确认密码' },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                                return Promise.resolve()
                            }
                            return Promise.reject(
                                new Error('两次输入的密码不一致')
                            )
                        },
                    }),
                ]}
            >
                <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="确认密码"
                    size="large"
                />
            </Form.Item>
        </AuthForm>
    )
}

export default Register
