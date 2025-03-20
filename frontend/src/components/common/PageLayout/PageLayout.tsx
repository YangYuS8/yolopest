import React from 'react'
import { Layout, Menu } from 'antd'
import { Link, useLocation } from 'react-router-dom'

const { Header, Content, Footer } = Layout

interface PageLayoutProps {
    children: React.ReactNode
}

const PageLayout = ({ children }: PageLayoutProps): React.ReactElement => {
    const location = useLocation()
    const currentYear = new Date().getFullYear()

    // 菜单配置
    const menuItems = [
        { key: '/', label: '首页' },
        { key: '/image-detection', label: '图像识别' },
        { key: '/video-detection', label: '视频识别' },
        { key: '/history', label: '历史记录' },
    ]

    return (
        <Layout style={{ minHeight: '100vh' }}>
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
                <div className="logo" style={{ marginRight: '24px' }}>
                    <Link to="/">
                        <h2 style={{ color: '#fff', margin: 0 }}>YoloPest</h2>
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
            </Header>
            <Content style={{ padding: '0 50px', marginTop: 16 }}>
                <div
                    style={{ background: '#fff', padding: 24, minHeight: 280 }}
                >
                    {children}
                </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>
                YoloPest ©{currentYear} - 基于YOLOv12的智能害虫检测系统
            </Footer>
        </Layout>
    )
}

export default PageLayout
