import React from 'react'
import { Tabs } from 'antd'
import type { TabsProps } from 'antd'

interface HistoryTabsProps {
    activeTab: string
    onChange: (tab: string) => void
}

export const HistoryTabs: React.FC<HistoryTabsProps> = ({
    activeTab,
    onChange,
}) => {
    const tabs: TabsProps['items'] = [
        { key: 'all', label: '全部', children: null },
        { key: 'image', label: '图像', children: null },
        { key: 'video', label: '视频', children: null },
    ]

    return (
        <Tabs
            activeKey={activeTab}
            onChange={onChange}
            items={tabs}
            style={{ marginBottom: 16 }}
        />
    )
}
