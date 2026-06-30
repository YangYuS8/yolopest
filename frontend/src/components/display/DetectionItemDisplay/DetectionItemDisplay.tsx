import React from 'react'
<<<<<<< HEAD
import { Tag, Tooltip, Progress } from 'antd'
import { InfoCircleOutlined, AimOutlined, RiseOutlined, FallOutlined, MinusOutlined } from '@ant-design/icons'
=======
import { Tag } from 'antd'
>>>>>>> origin_main
import { DetectionItem } from '../../../types'

interface DetectionItemDisplayProps {
    prediction: DetectionItem
    index: number
}

const DetectionItemDisplay: React.FC<DetectionItemDisplayProps> = ({
    prediction,
    index,
}) => {
<<<<<<< HEAD
    const zhName = prediction.class_zh || prediction.class
    const enName = prediction.class_en
    const aliases = prediction.aliases || []
    const confidencePct = prediction.confidence * 100
    const confidenceFixed = confidencePct.toFixed(1)

    // 置信度等级
    const level =
        prediction.confidence >= 0.8
            ? 'high'
            : prediction.confidence >= 0.6
            ? 'medium'
            : prediction.confidence >= 0.4
            ? 'low'
            : 'very-low'

    const levelMeta = {
        high: {
            label: '高置信度',
            color: '#10b981',
            bg: '#ecfdf5',
            border: '#a7f3d0',
            icon: <RiseOutlined />,
        },
        medium: {
            label: '较高置信度',
            color: '#3b82f6',
            bg: '#eff6ff',
            border: '#bfdbfe',
            icon: <RiseOutlined />,
        },
        low: {
            label: '低置信度',
            color: '#f59e0b',
            bg: '#fffbeb',
            border: '#fde68a',
            icon: <FallOutlined />,
        },
        'very-low': {
            label: '极低置信度',
            color: '#64748b',
            bg: '#f8fafc',
            border: '#e2e8f0',
            icon: <MinusOutlined />,
        },
    }[level]

    const bbox = prediction.bbox || prediction.box
    let positionText = ''
    if (bbox && 'x1' in bbox) {
        positionText = `X:${Math.round(bbox.x1)}–${Math.round(bbox.x2)} / Y:${Math.round(bbox.y1)}–${Math.round(bbox.y2)}`
    } else if (bbox && Array.isArray(bbox)) {
        positionText = `X:${Math.round(bbox[0])}–${Math.round(bbox[2])} / Y:${Math.round(bbox[1])}–${Math.round(bbox[3])}`
    }

    return (
        <div
            style={{
                background: '#fff',
                borderRadius: 14,
                padding: '18px 20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                border: `1px solid ${levelMeta.border}`,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.1)'
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'
            }}
        >
            {/* 头部：编号 + 名称 + 等级 */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    marginBottom: 14,
                    flexWrap: 'wrap',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: levelMeta.bg,
                            color: levelMeta.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 14,
                            border: `2px solid ${levelMeta.border}`,
                        }}
                    >
                        {index + 1}
                    </div>
                    <div>
                        <div
                            style={{
                                fontSize: 17,
                                fontWeight: 700,
                                color: '#1e293b',
                                lineHeight: 1.2,
                            }}
                        >
                            {zhName}
                        </div>
                        {enName && enName !== zhName && (
                            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                                {enName}
                            </div>
                        )}
                    </div>
                </div>
                <Tag
                    icon={levelMeta.icon}
                    color={levelMeta.color}
                    style={{ fontWeight: 600, borderRadius: 12 }}
                >
                    {levelMeta.label}
                </Tag>
            </div>

            {/* 置信度进度条 */}
            <div style={{ marginBottom: 14 }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 13,
                        color: '#64748b',
                        marginBottom: 6,
                    }}
                >
                    <span>置信度</span>
                    <span style={{ fontWeight: 700, color: levelMeta.color }}>{confidenceFixed}%</span>
                </div>
                <Progress
                    percent={Number(confidenceFixed)}
                    strokeColor={levelMeta.color}
                    trailColor="#e2e8f0"
                    showInfo={false}
                    strokeLinecap="round"
                    size={{ height: 10 }}
                />
            </div>

            {/* 底部：位置 + 别名 + 类别ID */}
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    color: '#64748b',
                }}
            >
                {positionText && (
                    <Tooltip title="检测框在图中的像素坐标">
                        <Tag icon={<AimOutlined />} color="default" style={{ borderRadius: 10 }}>
                            {positionText}
                        </Tag>
                    </Tooltip>
                )}
                {prediction.class_id !== undefined && (
                    <Tag color="purple" style={{ borderRadius: 10 }}>
                        类别 #{prediction.class_id}
                    </Tag>
                )}
                {aliases.length > 0 && (
                    <Tooltip title={`别名：${aliases.join('、')}`}>
                        <Tag
                            icon={<InfoCircleOutlined />}
                            color="default"
                            style={{ borderRadius: 10, cursor: 'help' }}
                        >
                            别名
                        </Tag>
                    </Tooltip>
                )}
            </div>
=======
    return (
        <div key={index} style={{ marginBottom: 8 }}>
            <p>
                害虫类型: <Tag color="blue">{prediction.class}</Tag>
            </p>
            <p>
                置信度:{' '}
                <Tag color="green">
                    {(prediction.confidence * 100).toFixed(1)}%
                </Tag>
            </p>
            {prediction.bbox && (
                <p>
                    位置: X[{Math.round(prediction.bbox.x1)}-
                    {Math.round(prediction.bbox.x2)}] Y[
                    {Math.round(prediction.bbox.y1)}-
                    {Math.round(prediction.bbox.y2)}]
                </p>
            )}
>>>>>>> origin_main
        </div>
    )
}

export default DetectionItemDisplay
