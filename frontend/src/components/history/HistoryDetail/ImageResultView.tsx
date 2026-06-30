import React from 'react'
<<<<<<< HEAD
import { Row, Col, Image, Descriptions, Tag } from 'antd'
=======
import { Row, Col, Image, Descriptions } from 'antd'
import { PestResult } from '../../../types'
>>>>>>> origin_main
import { HistoryRecord } from '../../../types/history'

interface ImageResultViewProps {
    record: HistoryRecord
    formatDate: (timestamp: number) => string
}

export const ImageResultView: React.FC<ImageResultViewProps> = ({
    record,
    formatDate,
}) => {
<<<<<<< HEAD
    const predictions = record.result.predictions || []
=======
    const imgResult = record.result as PestResult
>>>>>>> origin_main

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
<<<<<<< HEAD
                    <Descriptions.Item label="检测状态">
                        <Tag
                            color={
                                record.result.status === 'success'
                                    ? 'green'
                                    : record.result.status === 'no_detection'
                                      ? 'orange'
                                      : 'red'
                            }
                        >
                            {record.result.status}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="检测耗时">
                        {record.result.time_cost ?? 0}秒
                    </Descriptions.Item>
                    <Descriptions.Item label="检测数量">
                        {predictions.length}个目标
                    </Descriptions.Item>
                    {predictions.map((pred, idx) => (
                        <React.Fragment key={idx}>
                            <Descriptions.Item label={`目标 ${idx + 1} 类型`}>
                                {pred.class}
                            </Descriptions.Item>
                            <Descriptions.Item label={`目标 ${idx + 1} 置信度`}>
                                {(pred.confidence * 100).toFixed(2)}%
                            </Descriptions.Item>
                            <Descriptions.Item label={`目标 ${idx + 1} 坐标`}>
                                X[{pred.box[0]}-{pred.box[2]}] Y[{pred.box[1]}-
                                {pred.box[3]}]
                            </Descriptions.Item>
                        </React.Fragment>
                    ))}
=======
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
>>>>>>> origin_main
                </Descriptions>
            </Col>
        </Row>
    )
}
