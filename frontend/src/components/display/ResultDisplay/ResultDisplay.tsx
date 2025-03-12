import React from 'react'
import { Card, Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { PestResult } from '../../types'

interface ResultDisplayProps {
    loading: boolean
    previewImage: string
    result: PestResult | null
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({
    loading,
    previewImage,
    result,
}) => {
    return (
        <Card title="识别结果">
            {loading ? (
                <Spin
                    indicator={
                        <LoadingOutlined style={{ fontSize: 24 }} spin />
                    }
                />
            ) : (
                <>
                    {previewImage && (
                        <img
                            src={previewImage}
                            alt="预览"
                            style={{
                                maxWidth: '100%',
                                marginBottom: '16px',
                            }}
                        />
                    )}
                    {result && (
                        <div>
                            <p>检测耗时: {result.time_cost}s</p>

                            {/* 显示标注后的图像 */}
                            {result.annotated_image && (
                                <img
                                    src={result.annotated_image}
                                    alt="标注结果"
                                    style={{
                                        maxWidth: '100%',
                                        marginBottom: '16px',
                                        border: '1px solid #d9d9d9',
                                    }}
                                />
                            )}

                            {result.results.map((item, index) => (
                                <div key={index} style={{ marginBottom: 8 }}>
                                    <p>害虫类型: {item.class}</p>
                                    <p>
                                        置信度:{' '}
                                        {(item.confidence * 100).toFixed(1)}%
                                    </p>
                                    <p>
                                        位置: X[{item.bbox.x1}-{item.bbox.x2}]
                                        Y[
                                        {item.bbox.y1}-{item.bbox.y2}]
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </Card>
    )
}

export default ResultDisplay
