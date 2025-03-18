import React from 'react'
import { Input, Form } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import AuthForm from '../components/common/AuthForm/AuthForm'
import { useAuthForm } from '../hooks/useAuthForm'
import { login } from '../services/authService'

// 登录表单类型
interface LoginFormValues {
    email: string
    password: string
    [key: string]: unknown // 添加索引签名
}

const Login = (): React.ReactElement => {
    const { loading, error, handleSubmit, state } = useAuthForm('/')

    const onFinish = async (values: LoginFormValues): Promise<void> => {
        await handleSubmit<LoginFormValues>(
            (vals) => login(vals.email, vals.password),
            values,
            '登录成功'
        )
    }

    return (
        <AuthForm<LoginFormValues>
            title="登录"
            formName="login"
            onFinish={onFinish}
            loading={loading}
            error={error}
            successMessage={state?.message}
            submitText="登录"
            footerContent={
                <div style={{ textAlign: 'center' }}>
                    <Link to="/register">没有账号？点击注册</Link>
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
                    prefix={<UserOutlined />}
                    placeholder="邮箱"
                    size="large"
                />
            </Form.Item>

            <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
            >
                <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="密码"
                    size="large"
                />
            </Form.Item>
        </AuthForm>
    )
}

export default Login
