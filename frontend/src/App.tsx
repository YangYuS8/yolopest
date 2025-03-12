import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import {
    HomeOutlined,
    FileImageOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons'
import Home from './pages/Home'
import ImageDetection from './pages/ImageDetection'
import VideoDetection from './pages/VideoDetection'
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
                    }}
                >
                    <div className="logo">YoloPest</div>
                    <Menu
                        theme="dark"
                        mode="horizontal"
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
                        ].map((item) => ({
                            key: item.key,
                            icon: item.icon,
                            label: <a href={item.path}>{item.label}</a>,
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
