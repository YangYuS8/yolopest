import React from 'react'
import { Card, Button, Avatar } from 'antd'
import { Link } from 'react-router-dom'

interface MediaCardProps {
    title: string
    icon: React.ReactNode
    description: string
    actionPath: string
    actionText?: string
    iconColor?: string
}

const MediaCard: React.FC<MediaCardProps> = ({
    title,
    icon,
    description,
    actionPath,
    actionText = '开始使用',
    iconColor = '#1890ff',
}) => {
    return (
        <Card
            hoverable
            style={{ height: '100%' }}
            cover={
                <div
                    style={{
                        padding: 40,
                        background: '#f5f5f5',
                        textAlign: 'center',
                    }}
                >
                    <Avatar
                        size={64}
                        style={{
                            backgroundColor: 'transparent',
                            color: iconColor,
                            fontSize: 36,
                        }}
                        icon={icon}
                    />
                </div>
            }
            actions={[
                <Link to={actionPath} key="action">
                    <Button type="primary">{actionText}</Button>
                </Link>,
            ]}
        >
            <Card.Meta title={title} description={description} />
        </Card>
    )
}

export default MediaCard
