import React, { useEffect, useState } from 'react'
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link,
    Navigate,
} from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Space, App as AntdApp } from 'antd'
import {
    HomeOutlined,
    FileImageOutlined,
    VideoCameraOutlined,
    HistoryOutlined,
    UserOutlined,
    LogoutOutlined,
} from '@ant-design/icons'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import ImageDetection from './pages/ImageDetection'
import VideoDetection from './pages/VideoDetection'
import History from './pages/History'
import { getCurrentUser, logout } from './services/authService'
import { UserResponse } from './types/user'
import './App.css'

const { Header, Content, Footer } = Layout

// 受保护的路由组件
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const isAuthenticated = localStorage.getItem('accessToken')
    if (!isAuthenticated) {
        return <Navigate to="/login" />
    }
    return <>{children}</>
}

// 在 App 组件中，添加一个加载指示器
const App: React.FC = () => {
    const [user, setUser] = useState<UserResponse | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getCurrentUser()
                setUser(userData)
            } catch (error) {
                console.error('Failed to fetch user data', error)
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [])

    const handleLogout = () => {
        logout()
        setUser(null)
    }

    return (
        <AntdApp>
            <Router>
                <Layout className="layout" style={{ minHeight: '100vh' }}>
                    <Header
                        style={{
                            position: 'sticky',
                            top: 0,
                            zIndex: 1,
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div className="logo-link">
                                <div className="logo">YoloPest</div>
                            </div>
                            <Menu
                                theme="dark"
                                mode="horizontal"
                                style={{ flex: 1 }}
                                items={[
                                    {
                                        key: 'home',
                                        icon: <HomeOutlined />,
                                        label: '首页',
                                        path: '/',
                                    },
                                    {
                                        key: 'image',
                                        icon: <FileImageOutlined />,
                                        label: '图像识别',
                                        path: '/image-detection',
                                    },
                                    {
                                        key: 'video',
                                        icon: <VideoCameraOutlined />,
                                        label: '视频识别',
                                        path: '/video-detection',
                                    },
                                    {
                                        key: 'history',
                                        icon: <HistoryOutlined />,
                                        label: '历史记录',
                                        path: '/history',
                                    },
                                ].map((item) => ({
                                    key: item.key,
                                    icon: item.icon,
                                    label: (
                                        <Link to={item.path}>{item.label}</Link>
                                    ),
                                }))}
                            />
                        </div>

                        {/* 用户信息/登录按钮 */}
                        <div>
                            {loading ? (
                                <span style={{ color: 'white' }}>
                                    加载中...
                                </span>
                            ) : user ? (
                                <Dropdown
                                    menu={{
                                        items: [
                                            {
                                                key: 'profile',
                                                icon: <UserOutlined />,
                                                label: (
                                                    <Link to="/profile">
                                                        个人资料
                                                    </Link>
                                                ),
                                            },
                                            {
                                                key: 'logout',
                                                icon: <LogoutOutlined />,
                                                label: (
                                                    <div onClick={handleLogout}>
                                                        退出登录
                                                    </div>
                                                ),
                                            },
                                        ],
                                    }}
                                >
                                    <Space
                                        style={{
                                            color: 'white',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <Avatar icon={<UserOutlined />} />
                                        <span>{user.username}</span>
                                    </Space>
                                </Dropdown>
                            ) : (
                                <Link to="/login" style={{ color: 'white' }}>
                                    登录 / 注册
                                </Link>
                            )}
                        </div>
                    </Header>

                    <Content style={{ padding: '0 20px' }}>
                        <div className="site-layout-content">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route
                                    path="/register"
                                    element={<Register />}
                                />
                                <Route
                                    path="/profile"
                                    element={
                                        <ProtectedRoute>
                                            <Profile />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/image-detection"
                                    element={
                                        <ProtectedRoute>
                                            <ImageDetection />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/video-detection"
                                    element={
                                        <ProtectedRoute>
                                            <VideoDetection />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/history"
                                    element={
                                        <ProtectedRoute>
                                            <History />
                                        </ProtectedRoute>
                                    }
                                />
                            </Routes>
                        </div>
                    </Content>

                    <Footer style={{ textAlign: 'center' }}>
                        YoloPest ©{new Date().getFullYear()} - 智能害虫检测系统
                    </Footer>
                </Layout>
            </Router>
        </AntdApp>
    )
}

export default App
