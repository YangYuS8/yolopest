import { VideoDetectionFrame } from '../types'

/**
 * 根据视频帧数据获取当前时间下的注释帧
 * @param frames 视频检测帧数组
 * @param currentTime 当前播放时间（秒）
 * @returns 最接近当前时间的注释帧，如果没有则返回null
 */
export const getCurrentAnnotatedFrame = (
    frames: VideoDetectionFrame[],
    currentTime: number
): string | null => {
    if (!frames || frames.length === 0) return null

    // 转换为毫秒
    const timeMs = currentTime * 1000

    // 查找最接近当前时间的帧
    let closestFrame: VideoDetectionFrame | null = null
    let minTimeDiff = Infinity

    for (const frame of frames) {
        const diff = Math.abs(frame.timestamp - timeMs)
        if (diff < minTimeDiff) {
            minTimeDiff = diff
            closestFrame = frame
        }
    }

    // 如果最接近的帧时间差超过500ms，则认为当前时间点没有对应帧
    if (minTimeDiff > 500 || !closestFrame || !closestFrame.annotated_frame) {
        return null
    }

    return closestFrame.annotated_frame
}

/**
 * 从视频检测结果中统计各类害虫出现的次数
 */
export const getPestStatistics = (
    frames: VideoDetectionFrame[]
): Map<string, number> => {
    const pestCounts = new Map<string, number>()

    frames.forEach((frame) => {
        if (frame.detections && frame.detections.length > 0) {
            frame.detections.forEach((detection) => {
                const currentCount = pestCounts.get(detection.class) || 0
                pestCounts.set(detection.class, currentCount + 1)
            })
        }
    })

    return pestCounts
}
