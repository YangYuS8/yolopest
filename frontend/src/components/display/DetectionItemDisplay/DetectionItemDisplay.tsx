import React from 'react'
import { Tag } from 'antd'
import { DetectionItem } from '../../../types'

interface DetectionItemDisplayProps {
    prediction: DetectionItem
    index: number
}

const DetectionItemDisplay: React.FC<DetectionItemDisplayProps> = ({
    prediction,
    index,
}) => {
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
            {prediction.box && (
                <p>
                    位置: X[{Math.round(prediction.box.x1)}-
                    {Math.round(prediction.box.x2)}] Y[
                    {Math.round(prediction.box.y1)}-
                    {Math.round(prediction.box.y2)}]
                </p>
            )}
        </div>
    )
}

export default DetectionItemDisplay
