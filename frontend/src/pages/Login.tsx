import React from 'react'
import { Input, Form } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import AuthForm from '../components/common/AuthForm/AuthForm'
import { useAuth } from '../hooks/useAuth'
import { useAuthForm } from '../hooks/useAuthForm'
import { LoginFormValues } from '../types/form'

const Login = (): React.ReactElement => {
    const { login } = useAuth()
    const { loading, error, handleSubmit, state } = useAuthForm('/')

    const onFinish = async (values: LoginFormValues): Promise<void> => {
        // 使用 handleSubmit 处理登录流程，这样可以统一错误处理和重定向逻辑
        await handleSubmit(
            async () => {
                const success = await login(values.email, values.password)
                if (!success) {
                    // 如果登录失败，抛出错误让 handleSubmit 捕获
                    throw new Error('用户名或密码错误')
                }
                return success
            },
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
