import React, { useEffect } from 'react'
import { Layout, Menu, Avatar, Dropdown } from 'antd'
import { Link, useLocation } from 'react-router-dom'
import { UserOutlined, LogoutOutlined } from '@ant-design/icons'
import { useAuth } from '../../../hooks/useAuth'

const { Header, Content, Footer } = Layout

interface AppLayoutProps {
    children: React.ReactNode
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    const location = useLocation()
    const currentYear = new Date().getFullYear()
    const { user, logout, refreshUser } = useAuth()

    // 确保在组件挂载时刷新用户状态
    useEffect(() => {
        refreshUser()
    }, [refreshUser])

    // 菜单配置
    const menuItems = [
        { key: '/', label: '首页' },
        { key: '/image-detection', label: '图像识别' },
        { key: '/video-detection', label: '视频识别' },
        { key: '/statistics', label: '统计分析' },
        { key: '/history', label: '历史记录' },
    ]

    // 用户下拉菜单
    const userMenuItems = [
        {
            key: 'profile',
            label: <Link to="/profile">个人资料</Link>,
        },
        {
            key: 'logout',
            label: (
                <>
                    <LogoutOutlined /> 退出登录
                </>
            ),
            onClick: logout,
        },
    ]

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <div style={{ display: 'flex', flex: 1 }}>
                    <div className="logo" style={{ marginRight: '24px' }}>
                        <Link to="/">
                            <h2 style={{ color: '#fff', margin: 0 }}>
                                YoloPest
                            </h2>
                        </Link>
                    </div>
                    <Menu
                        theme="dark"
                        mode="horizontal"
                        selectedKeys={[location.pathname]}
                        items={menuItems.map((item) => ({
                            key: item.key,
                            label: <Link to={item.key}>{item.label}</Link>,
                        }))}
                        style={{ flex: 1, minWidth: 0 }}
                    />
                </div>

                {/* 用户区域 */}
                <div style={{ marginLeft: '20px' }}>
                    {user ? (
                        <Dropdown
                            menu={{ items: userMenuItems }}
                            placement="bottomRight"
                        >
                            <span style={{ color: '#fff', cursor: 'pointer' }}>
                                <Avatar
                                    icon={<UserOutlined />}
                                    style={{ marginRight: 8 }}
                                />
                                {user.username}
                            </span>
                        </Dropdown>
                    ) : (
                        <Link to="/login" style={{ color: '#fff' }}>
                            <UserOutlined style={{ marginRight: 8 }} />
                            登录
                        </Link>
                    )}
                </div>
            </Header>

            <Content style={{ padding: '0 50px', marginTop: 16 }}>
                <div
                    style={{ background: '#fff', padding: 24, minHeight: 280 }}
                >
                    {children}
                </div>
            </Content>

            <Footer style={{ textAlign: 'center' }}>
                YoloPest ©{currentYear} - 基于YOLOv8的智能害虫检测系统
            </Footer>
        </Layout>
    )
}

export default AppLayout
