import React from 'react'
import { Card, Divider, Alert, Tag } from 'antd'
import { VideoDetectionFrame } from '../../../types'

interface FrameDetectionViewProps {
    currentFrame: VideoDetectionFrame | null
}

const FrameDetectionView: React.FC<FrameDetectionViewProps> = ({
    currentFrame,
}) => {
    if (!currentFrame) return null

    return (
        <Card title={`当前帧检测结果 (帧 ${currentFrame.frame_index})`}>
            {currentFrame.annotated_frame ? (
                <img
                    src={currentFrame.annotated_frame}
                    alt="标注帧"
                    style={{ width: '100%' }}
                />
            ) : (
                <Alert message="此帧无标注图像" type="warning" />
            )}

            <Divider>检测到的目标</Divider>

            {currentFrame.detections && currentFrame.detections.length > 0 ? (
                currentFrame.detections.map((detection, idx) => (
                    <div key={idx} style={{ marginBottom: 12 }}>
                        <p>
                            害虫类型: <Tag color="blue">{detection.class}</Tag>
                            置信度:{' '}
                            {detection.confidence !== undefined
                                ? (detection.confidence * 100).toFixed(1)
                                : '0'}
                            %
                        </p>
                        <p>
                            位置: X[{detection.bbox?.x1 || 0}-
                            {detection.bbox?.x2 || 0}] Y[
                            {detection.bbox?.y1 || 0}-{detection.bbox?.y2 || 0}]
                        </p>
                    </div>
                ))
            ) : (
                <Alert message="此帧未检测到目标" type="info" />
            )}
        </Card>
    )
}

export default FrameDetectionView
