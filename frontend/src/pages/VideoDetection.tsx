import React, { useState, useEffect } from 'react'
import { Row, Col } from 'antd'
import { VideoPlayer } from '../components/media'
import {
    VideoUploadSection,
    VideoAnalysisResults,
    FrameDetectionView,
} from '../components/display'
import { useVideoUpload } from '../hooks/useVideoUpload'
import { useVideoPlayer } from '../hooks/useVideoPlayer'
import { getPestStatistics } from '../services/mediaService'
import { PageLayout } from '../components/layout'

const VideoDetection: React.FC = () => {
    const {
        videoUrl,
        result,
        loading,
        progress,
        handleVideoSelect,
        clearResults,
    } = useVideoUpload()

    const { currentFrame, findFrameByTime } = useVideoPlayer()
    const [pestStats, setPestStats] = useState<[string, number][]>([])

    // 当视频播放时间更新时，查找对应的检测帧
    const handleTimeUpdate = (time: number) => {
        if (result) {
            findFrameByTime(time, result)
        }
    }

    // 当检测结果改变时，更新害虫统计数据
    useEffect(() => {
        if (result && result.results) {
            const stats = getPestStatistics(result.results)
            setPestStats(
                Array.from(stats.entries()).sort((a, b) => b[1] - a[1])
            )
        }
    }, [result])

    return (
        <PageLayout title="视频害虫检测">
            <Row gutter={[16, 16]}>
                {/* 左侧部分：上传和分析结果 */}
                <VideoUploadSection
                    loading={loading}
                    progress={progress}
                    onVideoSelect={handleVideoSelect}
                />

                <Col span={24} md={12}>
                    {result && (
                        <VideoAnalysisResults
                            result={result}
                            pestStats={pestStats}
                            clearResults={clearResults}
                        />
                    )}
                </Col>

                {/* 右侧部分：视频播放和帧检测 */}
                <Col span={24} md={12}>
                    {videoUrl && (
                        <VideoPlayer
                            videoUrl={videoUrl}
                            result={result}
                            onTimeUpdate={handleTimeUpdate}
                        />
                    )}

                    <FrameDetectionView currentFrame={currentFrame} />
                </Col>
            </Row>
        </PageLayout>
    )
}

export default VideoDetection
