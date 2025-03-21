import React from 'react'
import { Card, Divider, Tag, List, Button } from 'antd'
import { VideoResult } from '../../../types'

interface VideoAnalysisResultsProps {
    result: VideoResult | null
    pestStats: [string, number][]
    clearResults?: () => void
}

const VideoAnalysisResults: React.FC<VideoAnalysisResultsProps> = ({
    result,
    pestStats,
    clearResults,
}) => {
    if (!result) return null

    return (
        <Card title="视频分析结果" style={{ marginTop: 16 }}>
            <p>
                分析耗时:{' '}
                {result.time_cost !== undefined
                    ? result.time_cost.toFixed(2)
                    : '计算中...'}
                秒
            </p>
            <p>
                视频长度:{' '}
                {result.video_length !== undefined
                    ? result.video_length.toFixed(2)
                    : '未知'}
                秒
            </p>
            <p>处理帧数: {result.processed_frames || 0}帧</p>
            <p>
                检测速率:{' '}
                {result.fps !== undefined ? result.fps.toFixed(2) : '计算中...'}
                帧/秒
            </p>

            <Divider>检测统计</Divider>

            <List
                size="small"
                dataSource={pestStats}
                renderItem={([pestType, count]) => (
                    <List.Item>
                        <Tag color="green">{pestType}</Tag>
                        共检测到 <strong>{count}</strong> 次
                    </List.Item>
                )}
            />

            {clearResults && (
                <Button
                    onClick={clearResults}
                    type="primary"
                    style={{ marginTop: 16 }}
                >
                    清除结果
                </Button>
            )}
        </Card>
    )
}

export default VideoAnalysisResults
