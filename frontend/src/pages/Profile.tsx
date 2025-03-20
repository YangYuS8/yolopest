import React, { useEffect, useState, useCallback } from 'react'
import { Form, Tabs } from 'antd'
import { getCurrentUser, updatePassword } from '../services/authService'
import { updateUserProfile } from '../services/userService'
import { UserResponse } from '../types/user'
import { PageLayout } from '../components/layout'
import { ProfileInfo, ProfileForm, PasswordModal } from '../components/profile'

const Profile: React.FC = () => {
    const [user, setUser] = useState<UserResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [showPasswordModal, setShowPasswordModal] = useState(false)

    const [form] = Form.useForm()
    const [passwordForm] = Form.useForm()

    const fetchUser = useCallback(async () => {
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
            setError('获取用户信息失败')
        } finally {
            setLoading(false)
        }
    }, [form, setUser, setError, setLoading])

    useEffect(() => {
        fetchUser()
    }, [fetchUser])

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
                <ProfileInfo
                    user={user}
                    error={error}
                    success={success}
                    loading={loading}
                    onClearSuccess={() => setSuccess(null)}
                    onClearError={() => setError(null)}
                    onShowPasswordModal={() => setShowPasswordModal(true)}
                />
            ),
        },
        {
            key: '2',
            label: '修改资料',
            children: (
                <ProfileForm
                    form={form}
                    loading={loading}
                    onSubmit={handleUpdateProfile}
                />
            ),
        },
    ]

    if (loading && !user) {
        return <div style={{ textAlign: 'center', padding: 50 }}>加载中...</div>
    }

    return (
        <PageLayout title="个人资料">
            <Tabs defaultActiveKey="1" items={items} />

            <PasswordModal
                visible={showPasswordModal}
                loading={loading}
                form={passwordForm}
                onCancel={() => setShowPasswordModal(false)}
                onSubmit={handleUpdatePassword}
            />
        </PageLayout>
    )
}

export default Profile
