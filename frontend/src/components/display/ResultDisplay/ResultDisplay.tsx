import React from 'react'
<<<<<<< HEAD
import { Card, Spin, Badge, Empty, Tag } from 'antd'
import { LoadingOutlined, ExperimentOutlined, CameraOutlined, FieldTimeOutlined, BugOutlined } from '@ant-design/icons'
import { PestResult, DetectionItem } from '../../../types'
import DetectionItemDisplay from '../DetectionItemDisplay/DetectionItemDisplay'
=======
import { Card, Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { PestResult } from '../../types'
>>>>>>> origin_main

interface ResultDisplayProps {
    loading: boolean
    previewImage: string
    result: PestResult | null
}

<<<<<<< HEAD
// 根据置信度给出"鉴定结论"文案
const getConclusion = (items: DetectionItem[]) => {
    const count = items.length
    if (count === 0) return '未检出目标害虫'
    const highConf = items.filter(i => i.confidence >= 0.7).length
    if (highConf === count) return `发现 ${count} 处高置信度害虫特征`
    if (highConf >= count / 2) return `发现 ${count} 处害虫特征，多数置信度较高`
    return `发现 ${count} 处疑似害虫特征，建议人工复核`
}

=======
>>>>>>> origin_main
const ResultDisplay: React.FC<ResultDisplayProps> = ({
    loading,
    previewImage,
    result,
}) => {
    return (
<<<<<<< HEAD
        <Card
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ExperimentOutlined style={{ color: '#10b981' }} />
                    <span>检测分析报告</span>
                </div>
            }
            styles={{
                body: {
                    padding: 0,
                    background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
                },
            }}
        >
            {loading ? (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '80px 20px',
                        gap: 16,
                    }}
                >
                    <Spin
                        indicator={
                            <LoadingOutlined style={{ fontSize: 42, color: '#10b981' }} spin />
                        }
                    />
                    <p style={{ color: '#64748b', margin: 0 }}>AI 正在分析图像特征…</p>
                </div>
            ) : (
                <>
                    {!result && !previewImage && (
                        <Empty
                            image={<CameraOutlined style={{ fontSize: 48, color: '#cbd5e1' }} />}
                            description="上传图片后将在此生成检测报告"
                            style={{ padding: '60px 20px' }}
                        />
                    )}

                    {result && (
                        <div style={{ padding: '20px' }}>
                            {/* 顶部摘要条 */}
                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 12,
                                    padding: '14px 18px',
                                    background: '#fff',
                                    borderRadius: 12,
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                    marginBottom: 20,
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <BugOutlined style={{ fontSize: 20, color: '#10b981' }} />
                                    <span style={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>
                                        {getConclusion(result.results)}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b' }}>
                                    <FieldTimeOutlined />
                                    <span>耗时 {result.time_cost}s</span>
                                    {result.results.length > 0 && (
                                        <Badge
                                            count={result.results.length}
                                            style={{ backgroundColor: '#10b981', marginLeft: 8 }}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* 主体：左侧大图 + 右侧详情 */}
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                                    gap: 20,
                                    alignItems: 'start',
                                }}
                            >
                                {/* 图像区 */}
                                <div
                                    style={{
                                        background: '#fff',
                                        borderRadius: 14,
                                        padding: 10,
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                        position: 'relative',
                                    }}
                                >
                                    {result.annotated_image ? (
                                        <>
                                            <Tag
                                                color="success"
                                                style={{
                                                    position: 'absolute',
                                                    top: 20,
                                                    left: 20,
                                                    zIndex: 2,
                                                    fontWeight: 600,
                                                    boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                                                }}
                                            >
                                                标注结果
                                            </Tag>
                                            <img
                                                src={result.annotated_image}
                                                alt="标注结果"
                                                style={{
                                                    width: '100%',
                                                    borderRadius: 10,
                                                    display: 'block',
                                                }}
                                            />
                                        </>
                                    ) : previewImage ? (
                                        <img
                                            src={previewImage}
                                            alt="预览"
                                            style={{
                                                width: '100%',
                                                borderRadius: 10,
                                                display: 'block',
                                            }}
                                        />
                                    ) : null}
                                </div>

                                {/* 详情区 */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    {result.results.length === 0 ? (
                                        <div
                                            style={{
                                                background: '#fff',
                                                borderRadius: 14,
                                                padding: '40px 24px',
                                                textAlign: 'center',
                                                color: '#64748b',
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                            }}
                                        >
                                            <p style={{ fontSize: 16, marginBottom: 8 }}>
                                                未在图中识别到害虫目标
                                            </p>
                                            <p style={{ fontSize: 13, color: '#94a3b8' }}>
                                                建议：更换更清晰的图片、调整光线或拉近拍摄距离后重试
                                            </p>
                                        </div>
                                    ) : (
                                        result.results.map((item, index) => (
                                            <DetectionItemDisplay
                                                prediction={item}
                                                index={index}
                                                key={index}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
=======
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
>>>>>>> origin_main
                        </div>
                    )}
                </>
            )}
        </Card>
    )
}

export default ResultDisplay
