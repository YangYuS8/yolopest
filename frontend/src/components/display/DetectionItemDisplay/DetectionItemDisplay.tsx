import React from 'react'
import { Tag } from 'antd'
import { DetectionItem } from '../../types'

interface DetectionItemDisplayProps {
    detection: DetectionItem
}

const DetectionItemDisplay: React.FC<DetectionItemDisplayProps> = ({
    detection,
}) => {
    return (
        <div style={{ marginBottom: 8 }}>
            <p>
                害虫类型: <Tag color="blue">{detection.class}</Tag>
            </p>
            <p>置信度: {(detection.confidence * 100).toFixed(1)}%</p>
            <p>
                位置: X[{detection.bbox.x1}-{detection.bbox.x2}] Y[
                {detection.bbox.y1}-{detection.bbox.y2}]
            </p>
        </div>
    )
}

export default DetectionItemDisplay
