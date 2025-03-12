import { useState, useCallback } from 'react'
import { VideoResult, VideoDetectionFrame } from '../types'

interface UseVideoPlayerReturn {
    currentFrame: VideoDetectionFrame | null
    findFrameByTime: (timeInSeconds: number, results: VideoResult) => void
}

/**
 * 视频播放器钩子，用于在播放视频时显示对应时间点的检测帧
 */
export const useVideoPlayer = (): UseVideoPlayerReturn => {
    const [currentFrame, setCurrentFrame] =
        useState<VideoDetectionFrame | null>(null)

    /**
     * 根据当前视频播放时间查找最接近的检测帧
     */
    const findFrameByTime = useCallback(
        (timeInSeconds: number, results: VideoResult) => {
            if (!results || !results.results || results.results.length === 0) {
                setCurrentFrame(null)
                return
            }

            // 将时间转换为毫秒
            const timeMs = timeInSeconds * 1000

            // 查找时间戳最接近当前时间的帧
            let closestFrame = results.results[0]
            let minDiff = Math.abs(closestFrame.timestamp - timeMs)

            for (const frame of results.results) {
                const diff = Math.abs(frame.timestamp - timeMs)
                if (diff < minDiff) {
                    minDiff = diff
                    closestFrame = frame
                }
            }

            // 如果最接近的帧相差超过500毫秒，不显示任何帧
            if (minDiff > 500) {
                setCurrentFrame(null)
            } else {
                setCurrentFrame(closestFrame)
            }
        },
        []
    )

    return {
        currentFrame,
        findFrameByTime,
    }
}
