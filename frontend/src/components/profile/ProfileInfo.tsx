import React from 'react'
import { Card, Descriptions, Button, Alert } from 'antd'
import { UserResponse } from '../../types/user'

interface ProfileInfoProps {
    user: UserResponse | null
    error: string | null
    success: string | null
    loading: boolean
    onClearSuccess: () => void
    onClearError: () => void
    onShowPasswordModal: () => void
}

export const ProfileInfo: React.FC<ProfileInfoProps> = ({
    user,
    error,
    success,
    onClearSuccess,
    onClearError,
    onShowPasswordModal,
}) => {
    return (
        <Card>
            {success && (
                <Alert
                    message={success}
                    type="success"
                    showIcon
                    closable
                    onClose={onClearSuccess}
                    style={{ marginBottom: 24 }}
                />
            )}

            {error && (
                <Alert
                    message={error}
                    type="error"
                    showIcon
                    closable
                    onClose={onClearError}
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
                            {new Date(user.created_at).toLocaleString('zh-CN')}
                        </Descriptions.Item>
                        <Descriptions.Item label="账户状态">
                            {user.is_active ? '激活' : '未激活'}
                        </Descriptions.Item>
                        <Descriptions.Item label="管理员权限">
                            {user.is_superuser ? '是' : '否'}
                        </Descriptions.Item>
                    </Descriptions>

                    <div style={{ marginTop: 24 }}>
                        <Button type="primary" onClick={onShowPasswordModal}>
                            修改密码
                        </Button>
                    </div>
                </>
            )}
        </Card>
    )
}
