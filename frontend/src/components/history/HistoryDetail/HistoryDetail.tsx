import React from 'react'
import { Modal, Button, Empty } from 'antd'
import { HistoryRecord } from '../../../types/history'
import { ImageResultView } from './ImageResultView'
import { VideoResultView } from './VideoResultView'

interface HistoryDetailProps {
    visible: boolean
    record: HistoryRecord | null
    onClose: () => void
    formatDate: (timestamp: number) => string
}

export const HistoryDetail: React.FC<HistoryDetailProps> = ({
    visible,
    record,
    onClose,
    formatDate,
}) => {
    const renderContent = () => {
        if (!record) return null

        switch (record.type) {
            case 'image':
                return (
                    <ImageResultView record={record} formatDate={formatDate} />
                )
            case 'video':
                return (
                    <VideoResultView record={record} formatDate={formatDate} />
                )
            default:
                return <Empty description="未知记录类型" />
        }
    }

    return (
        <Modal
            title="历史记录详情"
            open={visible}
            onCancel={onClose}
            width={800}
            footer={[
                <Button key="close" onClick={onClose}>
                    关闭
                </Button>,
            ]}
        >
            {renderContent()}
        </Modal>
    )
}
