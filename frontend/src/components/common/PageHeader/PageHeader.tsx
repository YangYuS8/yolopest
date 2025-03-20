import React, { ReactNode } from 'react'
import { Typography, Space, Divider } from 'antd'

const { Title } = Typography

interface PageHeaderProps {
    /**
     * 页面标题
     */
    title: string
    /**
     * 可选的副标题
     */
    subtitle?: string
    /**
     * 右侧操作按钮区域
     */
    actions?: ReactNode
    /**
     * 是否显示下方分隔线
     */
    divider?: boolean
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    subtitle,
    actions,
    divider = true,
}) => {
    return (
        <>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                }}
            >
                <div>
                    <Title level={2} style={{ margin: 0 }}>
                        {title}
                    </Title>
                    {subtitle && (
                        <Typography.Text type="secondary">
                            {subtitle}
                        </Typography.Text>
                    )}
                </div>
                {actions && <Space>{actions}</Space>}
            </div>
            {divider && <Divider style={{ margin: '16px 0' }} />}
        </>
    )
}

export default PageHeader
