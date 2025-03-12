import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import {
    HomeOutlined,
    FileImageOutlined,
    VideoCameraOutlined,
    HistoryOutlined, // 添加历史图标
} from '@ant-design/icons'
import Home from './pages/Home'
import ImageDetection from './pages/ImageDetection'
import VideoDetection from './pages/VideoDetection'
import History from './pages/History' // 导入历史记录页面
import './App.css'

const { Header, Content, Footer } = Layout

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Layout className="layout" style={{ minHeight: '100vh' }}>
                <Header
                    style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    {/* 将Link替换为普通div，防止链接导致的样式问题 */}
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
                            label: <Link to={item.path}>{item.label}</Link>,
                        }))}
                    />
                </Header>

                <Content style={{ padding: '0 20px' }}>
                    <div className="site-layout-content">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route
                                path="/image-detection"
                                element={<ImageDetection />}
                            />
                            <Route
                                path="/video-detection"
                                element={<VideoDetection />}
                            />
                            <Route path="/history" element={<History />} />
                        </Routes>
                    </div>
                </Content>

                <Footer style={{ textAlign: 'center' }}>
                    YoloPest ©{new Date().getFullYear()} - 智能害虫检测系统
                </Footer>
            </Layout>
        </BrowserRouter>
    )
}

export default App
