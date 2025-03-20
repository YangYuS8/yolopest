import React from 'react'
import { Button } from 'antd'
import { ReloadOutlined, DeleteOutlined } from '@ant-design/icons'

interface HistoryActionsProps {
    hasRecords: boolean
    loading: boolean
    onRefresh: () => void
    onClearAll: () => void
}

export const HistoryActions: React.FC<HistoryActionsProps> = ({
    hasRecords,
    loading,
    onRefresh,
    onClearAll,
}) => {
    return (
        <>
            <Button
                icon={<ReloadOutlined />}
                onClick={onRefresh}
                loading={loading}
            >
                刷新
            </Button>

            {hasRecords && (
                <Button danger onClick={onClearAll} icon={<DeleteOutlined />}>
                    清空历史
                </Button>
            )}
        </>
    )
}
