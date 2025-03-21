import React, { useState } from 'react'
import { Modal } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { useHistory } from '../services/historyService'
import { HistoryRecord } from '../types/history'
import { PageLayout } from '../components/layout'
import {
    HistoryList,
    HistoryActions,
    HistoryTabs,
    HistoryDetail,
} from '../components/history'

const { confirm } = Modal

const History: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>('all')
    const { records, loading, refreshRecords, deleteRecord, clearAllRecords } =
        useHistory(
            activeTab === 'all' ? undefined : (activeTab as 'image' | 'video')
        )
    const [previewVisible, setPreviewVisible] = useState(false)
    const [previewRecord, setPreviewRecord] = useState<HistoryRecord | null>(
        null
    )

    const handleDelete = (id: string) => {
        confirm({
            title: '确定要删除这条历史记录吗?',
            icon: <ExclamationCircleOutlined />,
            content: '删除后将无法恢复',
            onOk() {
                deleteRecord(id)
            },
        })
    }

    const handleClearAll = () => {
        confirm({
            title: '确定要清空所有历史记录吗?',
            icon: <ExclamationCircleOutlined />,
            content: '清空后将无法恢复',
            onOk() {
                clearAllRecords()
            },
        })
    }

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString('zh-CN')
    }

    const showDetailModal = (record: HistoryRecord) => {
        setPreviewRecord(record)
        setPreviewVisible(true)
    }

    return (
        <PageLayout title="历史记录">
            <HistoryActions
                hasRecords={records.length > 0}
                loading={loading}
                onRefresh={() => refreshRecords(true)}
                onClearAll={handleClearAll}
            />

            <HistoryTabs activeTab={activeTab} onChange={setActiveTab} />

            <HistoryList
                records={records}
                loading={loading}
                onDelete={handleDelete}
                onView={showDetailModal}
                formatDate={formatDate}
            />

            <HistoryDetail
                visible={previewVisible}
                record={previewRecord}
                onClose={() => setPreviewVisible(false)}
                formatDate={formatDate}
            />
        </PageLayout>
    )
}

export default History
