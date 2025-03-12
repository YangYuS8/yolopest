import { useState, useEffect, useCallback } from 'react' // 添加 useCallback 导入
import {
    getHistoryRecords as fetchHistoryRecords,
    createHistoryRecord,
    deleteHistoryRecord as removeHistoryRecord,
    clearHistoryRecords as clearAllHistoryRecords,
} from './api'
import { HistoryRecord } from '../types/history'

// 缓存机制，减少 API 请求
let cachedRecords: HistoryRecord[] | null = null
let lastFetchTime = 0
const CACHE_TTL = 60000 // 缓存有效期（毫秒）

/**
 * 添加历史记录
 */
export const addHistoryRecord = async (
    record: HistoryRecord
): Promise<void> => {
    try {
        // 修正：简化处理，确保时间戳始终是数字类型
        const serializedRecord = {
            ...record,
            // 确保 timestamp 是数字类型
            timestamp:
                typeof record.timestamp === 'number'
                    ? record.timestamp
                    : Date.now(), // 如果不是数字，则使用当前时间戳
            // 深拷贝结果以确保没有循环引用
            result: JSON.parse(JSON.stringify(record.result)),
        }

        await createHistoryRecord(serializedRecord)
        // 清除缓存，确保下次获取记录时重新获取
        cachedRecords = null
    } catch (error) {
        console.error('保存历史记录失败:', error)
    }
}

/**
 * 获取所有历史记录
 */
export const getHistoryRecords = async (
    forceRefresh = false,
    params?: { skip?: number; limit?: number; type?: 'image' | 'video' }
): Promise<HistoryRecord[]> => {
    const now = Date.now()

    // 使用缓存，除非强制刷新或缓存过期
    if (!forceRefresh && cachedRecords && now - lastFetchTime < CACHE_TTL) {
        return Promise.resolve(cachedRecords)
    }

    try {
        const records = await fetchHistoryRecords(params)
        cachedRecords = records
        lastFetchTime = now
        return records
    } catch (error) {
        console.error('获取历史记录失败:', error)
        return []
    }
}

/**
 * 清除所有历史记录
 */
export const clearHistoryRecords = async (): Promise<void> => {
    try {
        await clearAllHistoryRecords()
        cachedRecords = null
    } catch (error) {
        console.error('清除历史记录失败:', error)
    }
}

/**
 * 删除特定历史记录
 */
export const deleteHistoryRecord = async (id: string): Promise<void> => {
    try {
        await removeHistoryRecord(id)
        // 如果有缓存，更新缓存
        if (cachedRecords) {
            cachedRecords = cachedRecords.filter((item) => item.id !== id)
        }
    } catch (error) {
        console.error('删除历史记录失败:', error)
    }
}

/**
 * 自定义 Hook 用于历史记录
 */
export const useHistory = (type?: 'image' | 'video') => {
    const [records, setRecords] = useState<HistoryRecord[]>([])
    const [loading, setLoading] = useState(false)

    const fetchRecords = useCallback(
        async (forceRefresh = false) => {
            setLoading(true)
            try {
                const data = await getHistoryRecords(forceRefresh, { type })
                setRecords(data)
            } catch (error) {
                console.error('获取历史记录失败:', error)
            } finally {
                setLoading(false)
            }
        },
        [type]
    ) // 依赖 type

    useEffect(() => {
        fetchRecords()
    }, [fetchRecords]) // 现在 fetchRecords 只会在 type 改变时重新创建

    return {
        records,
        loading,
        refreshRecords: () => fetchRecords(true),
        deleteRecord: async (id: string) => {
            await deleteHistoryRecord(id)
            setRecords((prev) => prev.filter((item) => item.id !== id))
        },
        clearRecords: async () => {
            await clearHistoryRecords()
            setRecords([])
        },
    }
}
