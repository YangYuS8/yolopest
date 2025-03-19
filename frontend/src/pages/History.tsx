import React, { useState } from 'react'
import {
    Table,
    Button,
    Empty,
    Modal,
    Tag,
    Divider,
    Space,
    Image,
    Typography,
    Tabs,
    Spin,
    Row,
    Col,
    Descriptions,
} from 'antd'
import {
    DeleteOutlined,
    ExclamationCircleOutlined,
    FileImageOutlined,
    VideoCameraOutlined,
    ReloadOutlined,
    EyeOutlined,
} from '@ant-design/icons'
import { useHistory } from '../services/historyService'
import { HistoryRecord } from '../types/history'
import { PestResult, VideoResult } from '../types'
import type { TabsProps } from 'antd'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography
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

    const renderRecordContent = (record: HistoryRecord) => {
        switch (record.type) {
            case 'image': {
                const imgResult = record.result as PestResult
                // 调试输出，查看实际数据结构
                console.log('图像结果数据结构:', imgResult)

                // 增强结果展示逻辑以处理不同数据格式
                return (
                    <Row gutter={[16, 16]}>
                        <Col span={24} md={12}>
                            <Image
                                src={record.thumbnail}
                                alt={record.filename}
                                style={{ maxWidth: '100%' }}
                            />
                        </Col>
                        <Col span={24} md={12}>
                            <Descriptions title="检测信息" bordered column={1}>
                                <Descriptions.Item label="文件名">
                                    {record.filename}
                                </Descriptions.Item>
                                <Descriptions.Item label="检测时间">
                                    {formatDate(record.timestamp)}
                                </Descriptions.Item>
                                <Descriptions.Item label="检测耗时">
                                    {imgResult.time_cost}秒
                                </Descriptions.Item>

                                {/* 处理标准结果格式 */}
                                {imgResult.result && (
                                    <>
                                        <Descriptions.Item label="检测结果">
                                            {imgResult.result.pest}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="置信度">
                                            {(
                                                imgResult.result.confidence *
                                                100
                                            ).toFixed(2)}
                                            %
                                        </Descriptions.Item>
                                        {imgResult.result.description && (
                                            <Descriptions.Item label="描述">
                                                {imgResult.result.description}
                                            </Descriptions.Item>
                                        )}
                                    </>
                                )}

                                {/* 处理批量上传的结果格式 */}
                                {!imgResult.result &&
                                    imgResult.predictions &&
                                    imgResult.predictions.length > 0 && (
                                        <>
                                            <Descriptions.Item label="检测数量">
                                                {imgResult.predictions.length}
                                                个目标
                                            </Descriptions.Item>
                                            {imgResult.predictions.map(
                                                (pred, idx) => (
                                                    <React.Fragment key={idx}>
                                                        <Descriptions.Item
                                                            label={`目标 ${idx + 1} 类型`}
                                                        >
                                                            {pred.class ||
                                                                pred.pest}
                                                        </Descriptions.Item>
                                                        <Descriptions.Item
                                                            label={`目标 ${idx + 1} 置信度`}
                                                        >
                                                            {(
                                                                (pred.confidence ||
                                                                    0) * 100
                                                            ).toFixed(2)}
                                                            %
                                                        </Descriptions.Item>
                                                    </React.Fragment>
                                                )
                                            )}
                                        </>
                                    )}
                            </Descriptions>
                        </Col>
                    </Row>
                )
            }
            case 'video': {
                const videoResult = record.result as VideoResult
                return (
                    <>
                        <Row gutter={[16, 16]}>
                            <Col span={24} md={12}>
                                {record.thumbnail && (
                                    <Image
                                        src={record.thumbnail}
                                        alt={record.filename}
                                        style={{ maxWidth: '100%' }}
                                    />
                                )}
                            </Col>
                            <Col span={24} md={12}>
                                <Descriptions
                                    title="检测信息"
                                    bordered
                                    column={1}
                                >
                                    <Descriptions.Item label="文件名">
                                        {record.filename}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="检测时间">
                                        {formatDate(record.timestamp)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="视频长度">
                                        {videoResult.video_length?.toFixed(2)}秒
                                    </Descriptions.Item>
                                    <Descriptions.Item label="处理帧数">
                                        {videoResult.processed_frames}帧
                                    </Descriptions.Item>
                                    <Descriptions.Item label="处理速率">
                                        {videoResult.fps?.toFixed(2)}帧/秒
                                    </Descriptions.Item>
                                </Descriptions>
                            </Col>
                        </Row>
                    </>
                )
            }
            default:
                return <Empty description="未知记录类型" />
        }
    }

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
                        onClick={() => showDetailModal(record)}
                    >
                        查看
                    </Button>
                    <Button
                        icon={<DeleteOutlined />}
                        danger
                        size="small"
                        onClick={() => handleDelete(record.id)}
                    />
                </Space>
            ),
        },
    ]

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
            <Space
                style={{
                    marginBottom: 16,
                    width: '100%',
                    justifyContent: 'space-between',
                }}
            >
                <Title level={2}>历史记录</Title>
                <Space>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => refreshRecords(true)}
                        loading={loading}
                    >
                        刷新
                    </Button>

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
            </Space>

            <Divider />

            <Tabs
                activeKey={activeTab}
                items={tabs}
                onChange={setActiveTab}
                style={{ marginBottom: 16 }}
            />

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin size="large" />
                </div>
            ) : records.length === 0 ? (
                <Empty description="暂无历史记录" />
            ) : (
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
            )}

            <Modal
                title="历史记录详情"
                open={previewVisible}
                onCancel={() => setPreviewVisible(false)}
                width={800}
                footer={[
                    <Button
                        key="close"
                        onClick={() => setPreviewVisible(false)}
                    >
                        关闭
                    </Button>,
                ]}
            >
                {previewRecord && renderRecordContent(previewRecord)}
            </Modal>
        </div>
    )
}

export default History
