import React from 'react'
import { Card, Spin, Empty, List, Tag, Collapse, Image, Typography } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { BatchResult } from '../../hooks/useMultipleImageUpload'
import type { CollapseProps } from 'antd'

const { Text } = Typography

interface BatchResultDisplayProps {
    loading: boolean
    selectedFiles: File[]
    batchResult: BatchResult | null
    onClear: () => void
}

const BatchResultDisplay: React.FC<BatchResultDisplayProps> = ({
    loading,
    selectedFiles,
    batchResult,
    onClear,
}) => {
    if (loading) {
        return (
            <Card title="批量处理结果">
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin
                        indicator={
                            <LoadingOutlined style={{ fontSize: 24 }} spin />
                        }
                    />
                    <p style={{ marginTop: 16 }}>
                        正在处理 {selectedFiles.length} 个文件...
                    </p>
                </div>
            </Card>
        )
    }

    if (!batchResult) {
        return (
            <Card title="批量处理结果">
                <Empty description="尚未上传文件或处理结果为空" />
            </Card>
        )
    }

    return (
        <Card
            title={`批量处理结果 (共${batchResult.processed_count}个文件，耗时${batchResult.time_cost}秒)`}
            extra={<a onClick={onClear}>清空</a>}
        >
            <List
                dataSource={batchResult.results}
                renderItem={(item, index) => {
                    // 为每个结果项创建折叠面板的配置
                    const collapseItems: CollapseProps['items'] = [
                        {
                            key: index.toString(),
                            label: (
                                <div>
                                    <Text strong>{item.filename}</Text>
                                    {item.error ? (
                                        <Tag
                                            color="red"
                                            style={{ marginLeft: 8 }}
                                        >
                                            处理失败
                                        </Tag>
                                    ) : (
                                        <Tag
                                            color="green"
                                            style={{ marginLeft: 8 }}
                                        >
                                            检测到{' '}
                                            {item.predictions?.length || 0}{' '}
                                            个结果
                                        </Tag>
                                    )}
                                </div>
                            ),
                            children: item.error ? (
                                <div>错误信息: {item.error}</div>
                            ) : (
                                <div>
                                    {item.annotated_image && (
                                        <div style={{ marginBottom: 16 }}>
                                            <Image
                                                src={item.annotated_image}
                                                alt="标注结果"
                                                style={{ maxWidth: '100%' }}
                                            />
                                        </div>
                                    )}

                                    {item.predictions &&
                                    item.predictions.length > 0 ? (
                                        item.predictions.map((pred, pidx) => (
                                            <div
                                                key={pidx}
                                                style={{
                                                    marginBottom: 8,
                                                }}
                                            >
                                                <p>害虫类型: {pred.class}</p>
                                                <p>
                                                    置信度:{' '}
                                                    {(
                                                        pred.confidence * 100
                                                    ).toFixed(1)}
                                                    %
                                                </p>
                                                <p>
                                                    位置: X[
                                                    {pred.bbox.x1}-
                                                    {pred.bbox.x2}] Y[
                                                    {pred.bbox.y1}-
                                                    {pred.bbox.y2}]
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <Empty description="未检测到害虫" />
                                    )}
                                </div>
                            ),
                        },
                    ]

                    return (
                        <List.Item>
                            <Collapse
                                style={{ width: '100%' }}
                                items={collapseItems}
                            />
                        </List.Item>
                    )
                }}
            />
        </Card>
    )
}

export default BatchResultDisplay
