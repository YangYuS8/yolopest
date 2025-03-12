import React from 'react'
import { Divider } from 'antd'

interface PageLayoutProps {
    title: string
    children: React.ReactNode
}

const PageLayout: React.FC<PageLayoutProps> = ({ title, children }) => {
    return (
        <div style={{ padding: '20px', width: '100%' }}>
            <h1>{title}</h1>
            <Divider />
            {children}
        </div>
    )
}

export default PageLayout
