import React from 'react'
import { Layout, Typography, Breadcrumb, Space } from 'antd'
import { HomeOutlined } from '@ant-design/icons'

const { Content } = Layout
const { Title } = Typography

interface PageLayoutProps {
    title: string
    children: React.ReactNode
    breadcrumb?: { title: string; path?: string }[]
}

const PageLayout: React.FC<PageLayoutProps> = ({
    title,
    children,
    breadcrumb = [],
}) => {
    return (
        <div className="page-container">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                {breadcrumb.length > 0 && (
                    <Breadcrumb
                        items={[
                            {
                                title: <HomeOutlined />,
                                href: '/',
                            },
                            ...breadcrumb.map((item) => ({
                                title: item.title,
                                href: item.path,
                            })),
                        ]}
                    />
                )}

                <Title level={2}>{title}</Title>

                <Content className="site-content">{children}</Content>
            </Space>
        </div>
    )
}

export default PageLayout
