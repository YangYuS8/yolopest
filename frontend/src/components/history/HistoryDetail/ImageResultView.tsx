import React from 'react'
import { Row, Col, Image, Descriptions } from 'antd'
import { PestResult } from '../../../types'
import { HistoryRecord } from '../../../types/history'

interface ImageResultViewProps {
    record: HistoryRecord
    formatDate: (timestamp: number) => string
}

export const ImageResultView: React.FC<ImageResultViewProps> = ({
    record,
    formatDate,
}) => {
    const imgResult = record.result as PestResult

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
                                {(imgResult.result.confidence * 100).toFixed(2)}
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
                                    {imgResult.predictions.length}个目标
                                </Descriptions.Item>
                                {imgResult.predictions.map((pred, idx) => (
                                    <React.Fragment key={idx}>
                                        <Descriptions.Item
                                            label={`目标 ${idx + 1} 类型`}
                                        >
                                            {pred.class || pred.pest}
                                        </Descriptions.Item>
                                        <Descriptions.Item
                                            label={`目标 ${idx + 1} 置信度`}
                                        >
                                            {(
                                                (pred.confidence || 0) * 100
                                            ).toFixed(2)}
                                            %
                                        </Descriptions.Item>
                                    </React.Fragment>
                                ))}
                            </>
                        )}
                </Descriptions>
            </Col>
        </Row>
    )
}
