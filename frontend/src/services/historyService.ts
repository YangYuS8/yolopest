import { HistoryRecord } from '../types/history'

const HISTORY_STORAGE_KEY = 'yolopest_history'
const MAX_HISTORY_ITEMS = 100

/**
 * 添加历史记录
 */
export const addHistoryRecord = (record: HistoryRecord): void => {
    const history = getHistoryRecords()

    // 检查是否已存在相同ID的记录，如果有则移除
    const filteredHistory = history.filter((item) => item.id !== record.id)

    // 将新记录添加到历史记录列表的开头
    const updatedHistory = [record, ...filteredHistory]

    // 如果历史记录超过限制，则删除最旧的记录
    if (updatedHistory.length > MAX_HISTORY_ITEMS) {
        updatedHistory.pop()
    }

    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory))
}

/**
 * 获取所有历史记录
 */
export const getHistoryRecords = (): HistoryRecord[] => {
    const historyData = localStorage.getItem(HISTORY_STORAGE_KEY)
    if (!historyData) return []

    try {
        return JSON.parse(historyData) as HistoryRecord[]
    } catch (error) {
        console.error('解析历史记录失败:', error)
        return []
    }
}

/**
 * 清除所有历史记录
 */
export const clearHistoryRecords = (): void => {
    localStorage.removeItem(HISTORY_STORAGE_KEY)
}

/**
 * 删除特定历史记录
 */
export const deleteHistoryRecord = (id: string): void => {
    const history = getHistoryRecords()
    const updatedHistory = history.filter((item) => item.id !== id)
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory))
}
