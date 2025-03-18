import React, { useEffect, useState } from 'react'
import {
    Card,
    Form,
    Input,
    Button,
    Alert,
    Tabs,
    Modal,
    Descriptions,
} from 'antd'
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons'
import { getCurrentUser, updatePassword } from '../services/authService'
import { updateUserProfile } from '../services/userService'
import { UserResponse } from '../types/user'
// 从 layout 文件夹导入正确的 PageLayout
import { PageLayout } from '../components/layout'

const Profile: React.FC = () => {
    const [user, setUser] = useState<UserResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [showPasswordModal, setShowPasswordModal] = useState(false)

    const [form] = Form.useForm()
    const [passwordForm] = Form.useForm()

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getCurrentUser()
                setUser(userData)
                if (userData) {
                    form.setFieldsValue({
                        username: userData.username,
                        email: userData.email,
                    })
                }
            } catch {
                // 移除未使用的 error 参数
                setError('获取用户信息失败')
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [form])

    const handleUpdateProfile = async (values: {
        username: string
        email: string
    }) => {
        if (!user) return

        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            await updateUserProfile(user.id, values)
            setSuccess('个人资料更新成功')

            // 更新本地用户数据
            setUser({
                ...user,
                username: values.username,
                email: values.email,
            })
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error ? error.message : '更新资料失败'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdatePassword = async (values: {
        current_password: string
        new_password: string
    }) => {
        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            await updatePassword(values.current_password, values.new_password)
            setSuccess('密码更新成功')
            setShowPasswordModal(false)
            passwordForm.resetFields()
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error ? error.message : '密码更新失败'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const items = [
        {
            key: '1',
            label: '个人信息',
            children: (
                <Card>
                    {success && (
                        <Alert
                            message={success}
                            type="success"
                            showIcon
                            closable
                            onClose={() => setSuccess(null)}
                            style={{ marginBottom: 24 }}
                        />
                    )}

                    {error && (
                        <Alert
                            message={error}
                            type="error"
                            showIcon
                            closable
                            onClose={() => setError(null)}
                            style={{ marginBottom: 24 }}
                        />
                    )}

                    {user && (
                        <>
                            <Descriptions column={1} bordered>
                                <Descriptions.Item label="用户ID">
                                    {user.id}
                                </Descriptions.Item>
                                <Descriptions.Item label="用户名">
                                    {user.username}
                                </Descriptions.Item>
                                <Descriptions.Item label="邮箱">
                                    {user.email}
                                </Descriptions.Item>
                                <Descriptions.Item label="注册时间">
                                    {new Date(user.created_at).toLocaleString(
                                        'zh-CN'
                                    )}
                                </Descriptions.Item>
                                <Descriptions.Item label="账户状态">
                                    {user.is_active ? '激活' : '未激活'}
                                </Descriptions.Item>
                                <Descriptions.Item label="管理员权限">
                                    {user.is_superuser ? '是' : '否'}
                                </Descriptions.Item>
                            </Descriptions>

                            <div style={{ marginTop: 24 }}>
                                <Button
                                    type="primary"
                                    onClick={() => setShowPasswordModal(true)}
                                >
                                    修改密码
                                </Button>
                            </div>
                        </>
                    )}
                </Card>
            ),
        },
        {
            key: '2',
            label: '修改资料',
            children: (
                <Card>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleUpdateProfile}
                    >
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
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                            >
                                保存修改
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            ),
        },
    ]

    if (loading && !user) {
        return <div style={{ textAlign: 'center', padding: 50 }}>加载中...</div>
    }

    return (
        <PageLayout title="个人资料">
            <Tabs defaultActiveKey="1" items={items} />

            <Modal
                title="修改密码"
                open={showPasswordModal}
                onCancel={() => setShowPasswordModal(false)}
                footer={null}
            >
                <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handleUpdatePassword}
                >
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
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                        >
                            确认修改
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </PageLayout>
    )
}

export default Profile
