import React, { useState, useEffect } from 'react'
import {
    Card,
    List,
    Button,
    Empty,
    Modal,
    Tag,
    Divider,
    Space,
    Image,
    Typography,
    Tabs,
} from 'antd'
import {
    DeleteOutlined,
    ExclamationCircleOutlined,
    FileImageOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons'
import {
    getHistoryRecords,
    deleteHistoryRecord,
    clearHistoryRecords,
} from '../services/historyService'
import { HistoryRecord } from '../types/history'
import { PestResult, VideoResult } from '../types'
import type { TabsProps } from 'antd'

const { Title, Text } = Typography
const { confirm } = Modal

const History: React.FC = () => {
    const [records, setRecords] = useState<HistoryRecord[]>([])
    const [activeTab, setActiveTab] = useState<string>('all')

    useEffect(() => {
        loadHistory()
    }, [])

    const loadHistory = () => {
        const historyData = getHistoryRecords()
        setRecords(historyData)
    }

    const handleDelete = (id: string) => {
        confirm({
            title: '确定要删除这条历史记录吗?',
            icon: <ExclamationCircleOutlined />,
            content: '删除后将无法恢复',
            onOk() {
                deleteHistoryRecord(id)
                loadHistory()
            },
        })
    }

    const handleClearAll = () => {
        confirm({
            title: '确定要清空所有历史记录吗?',
            icon: <ExclamationCircleOutlined />,
            content: '清空后将无法恢复',
            onOk() {
                clearHistoryRecords()
                setRecords([])
            },
        })
    }

    const getFilteredRecords = () => {
        if (activeTab === 'all') return records
        return records.filter((record) => record.type === activeTab)
    }

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString('zh-CN')
    }

    const renderRecordContent = (record: HistoryRecord) => {
        switch (record.type) {
            case 'image': {
                const imgResult = record.result as PestResult
                return (
                    <>
                        <Image
                            src={record.thumbnail}
                            alt={record.filename}
                            style={{ maxWidth: '100%', maxHeight: '200px' }}
                        />
                        <Divider orientation="left">检测结果</Divider>
                        <p>检测耗时: {imgResult.time_cost}s</p>
                        <p>检测到 {imgResult.results.length} 个目标</p>
                    </>
                )
            }
            case 'video': {
                const videoResult = record.result as VideoResult
                return (
                    <>
                        {record.thumbnail && (
                            <Image
                                src={record.thumbnail}
                                alt={record.filename}
                                style={{ maxWidth: '100%', maxHeight: '200px' }}
                            />
                        )}
                        <Divider orientation="left">检测结果</Divider>
                        <p>
                            视频长度: {videoResult.video_length?.toFixed(2)}秒
                        </p>
                        <p>处理帧数: {videoResult.processed_frames}帧</p>
                        <p>处理速率: {videoResult.fps?.toFixed(2)}帧/秒</p>
                    </>
                )
            }
            default:
                return <p>未知记录类型</p>
        }
    }

    const tabs: TabsProps['items'] = [
        {
            key: 'all',
            label: '全部',
            children: null,
        },
        {
            key: 'image',
            label: '图像',
            children: null,
        },
        {
            key: 'video',
            label: '视频',
            children: null,
        },
    ]

    return (
        <div style={{ padding: '20px' }}>
            <Title level={2}>历史记录</Title>
            <Divider />

            <Space style={{ marginBottom: 16 }}>
                <Tabs
                    activeKey={activeTab}
                    items={tabs}
                    onChange={setActiveTab}
                />

                {records.length > 0 && (
                    <Button
                        danger
                        onClick={handleClearAll}
                        icon={<DeleteOutlined />}
                    >
                        清空历史
                    </Button>
                )}
            </Space>

            {records.length === 0 ? (
                <Empty description="暂无历史记录" />
            ) : (
                <List
                    grid={{
                        gutter: 16,
                        xs: 1,
                        sm: 2,
                        md: 2,
                        lg: 3,
                        xl: 3,
                        xxl: 4,
                    }}
                    dataSource={getFilteredRecords()}
                    renderItem={(record) => (
                        <List.Item>
                            <Card
                                title={
                                    <Space>
                                        {record.type === 'image' ? (
                                            <FileImageOutlined />
                                        ) : (
                                            <VideoCameraOutlined />
                                        )}
                                        <Text
                                            ellipsis
                                            style={{ maxWidth: 150 }}
                                        >
                                            {record.filename}
                                        </Text>
                                    </Space>
                                }
                                extra={
                                    <Button
                                        icon={<DeleteOutlined />}
                                        size="small"
                                        danger
                                        onClick={() => handleDelete(record.id)}
                                    />
                                }
                            >
                                <Space
                                    direction="vertical"
                                    style={{ width: '100%' }}
                                >
                                    <Tag
                                        color={
                                            record.type === 'image'
                                                ? 'blue'
                                                : 'green'
                                        }
                                    >
                                        {record.type === 'image'
                                            ? '图像识别'
                                            : '视频识别'}
                                    </Tag>
                                    <div>
                                        时间: {formatDate(record.timestamp)}
                                    </div>
                                    <Divider style={{ margin: '12px 0' }} />
                                    {renderRecordContent(record)}
                                </Space>
                            </Card>
                        </List.Item>
                    )}
                />
            )}
        </div>
    )
}

export default History
