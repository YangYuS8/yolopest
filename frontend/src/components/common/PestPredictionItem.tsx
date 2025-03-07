import React from 'react'

interface BBox {
    x1: number
    y1: number
    x2: number
    y2: number
}

interface PredictionProps {
    className: string
    confidence: number
    bbox: BBox
}

const PestPredictionItem: React.FC<PredictionProps> = ({
    className,
    confidence,
    bbox,
}) => {
    return (
        <div style={{ marginBottom: 8 }}>
            <p>害虫类型: {className}</p>
            <p>置信度: {(confidence * 100).toFixed(1)}%</p>
            <p>
                位置: X[{bbox.x1}-{bbox.x2}] Y[{bbox.y1}-{bbox.y2}]
            </p>
        </div>
    )
}

export default PestPredictionItem
