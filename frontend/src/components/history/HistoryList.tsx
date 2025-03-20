import React from 'react'
import { Table, Tag, Space, Typography, Empty, Spin, Button } from 'antd'
import {
    FileImageOutlined,
    VideoCameraOutlined,
    EyeOutlined,
    DeleteOutlined,
} from '@ant-design/icons'
import { HistoryRecord } from '../../types/history'
import { PestResult, VideoResult } from '../../types'
import type { ColumnsType } from 'antd/es/table'

const { Text } = Typography

interface HistoryListProps {
    records: HistoryRecord[]
    loading: boolean
    onDelete: (id: string) => void
    onView: (record: HistoryRecord) => void
    formatDate: (timestamp: number) => string
}

export const HistoryList: React.FC<HistoryListProps> = ({
    records,
    loading,
    onDelete,
    onView,
    formatDate,
}) => {
    const columns: ColumnsType<HistoryRecord> = [
        {
            title: '类型',
            key: 'type',
            width: 100,
            render: (_, record) => (
                <Tag color={record.type === 'image' ? 'blue' : 'green'}>
                    {record.type === 'image' ? '图像' : '视频'}
                </Tag>
            ),
            filters: [
                { text: '图像', value: 'image' },
                { text: '视频', value: 'video' },
            ],
            onFilter: (value, record) => record.type === value,
        },
        {
            title: '文件名',
            dataIndex: 'filename',
            key: 'filename',
            ellipsis: true,
            render: (text, record) => (
                <Space>
                    {record.type === 'image' ? (
                        <FileImageOutlined />
                    ) : (
                        <VideoCameraOutlined />
                    )}
                    <Text ellipsis>{text}</Text>
                </Space>
            ),
            sorter: (a, b) => a.filename.localeCompare(b.filename),
        },
        {
            title: '时间',
            key: 'timestamp',
            width: 180,
            render: (_, record) => formatDate(record.timestamp),
            sorter: (a, b) => a.timestamp - b.timestamp,
            defaultSortOrder: 'descend',
        },
        {
            title: '结果',
            key: 'result',
            render: (_, record) => {
                if (record.type === 'image') {
                    const imgResult = record.result as PestResult

                    // 处理标准结果格式
                    if (imgResult.result) {
                        return (
                            <Tag color="green">
                                {imgResult.result.pest} (
                                {(imgResult.result.confidence * 100).toFixed(1)}
                                %)
                            </Tag>
                        )
                    }
                    // 处理批量上传结果格式
                    else if (
                        imgResult.predictions &&
                        imgResult.predictions.length > 0
                    ) {
                        const firstPred = imgResult.predictions[0]
                        return (
                            <Tag color="green">
                                {firstPred.class || firstPred.pest} (
                                {imgResult.predictions.length > 1
                                    ? `+${imgResult.predictions.length - 1}项`
                                    : ''}
                                )
                            </Tag>
                        )
                    }
                    // 真的没检测到目标
                    else {
                        return <Tag color="orange">未检测到目标</Tag>
                    }
                } else if (record.type === 'video') {
                    const videoResult = record.result as VideoResult
                    return (
                        <Tag color="green">
                            {videoResult.processed_frames}帧
                        </Tag>
                    )
                }
                return null
            },
        },
        {
            title: '操作',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        type="primary"
                        size="small"
                        onClick={() => onView(record)}
                    >
                        查看
                    </Button>
                    <Button
                        icon={<DeleteOutlined />}
                        danger
                        size="small"
                        onClick={() => onDelete(record.id)}
                    />
                </Space>
            ),
        },
    ]

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin size="large" />
            </div>
        )
    }

    if (records.length === 0) {
        return <Empty description="暂无历史记录" />
    }

    return (
        <Table
            columns={columns}
            dataSource={records}
            rowKey="id"
            pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条记录`,
            }}
        />
    )
}
