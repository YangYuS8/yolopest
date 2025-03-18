import api from '../utils/axiosConfig' // 使用统一的 api 实例
import { useState, useCallback, useEffect } from 'react'
import { HistoryRecord } from '../types/history'

// 缓存设置
const CACHE_TTL = 60000 // 1分钟缓存
let cachedRecords: HistoryRecord[] | null = null
let lastFetchTime = 0

export const getHistoryRecords = async (
    type?: string,
    forceRefresh = false
): Promise<HistoryRecord[]> => {
    try {
        // 检查缓存是否有效
        if (
            !forceRefresh &&
            cachedRecords &&
            Date.now() - lastFetchTime < CACHE_TTL
        ) {
            // 如果请求特定类型，过滤缓存结果
            if (type) {
                return cachedRecords.filter((record) => record.type === type)
            }
            return cachedRecords
        }

        // 构建URL参数对象，而不是拼接字符串
        const params = type ? { type } : undefined
        const response = await api.get('/history', { params })

        cachedRecords = response.data
        lastFetchTime = Date.now()
        return response.data
    } catch (error) {
        console.error('获取历史记录失败:', error)
        return []
    }
}

export const getHistoryRecord = async (
    id: string
): Promise<HistoryRecord | null> => {
    try {
        const response = await api.get(`/history/${id}`)
        return response.data
    } catch (error) {
        console.error(`获取历史记录 ${id} 失败:`, error)
        return null
    }
}

export const deleteHistoryRecord = async (id: string): Promise<boolean> => {
    try {
        await api.delete(`/history/${id}`)
        cachedRecords = null
        return true
    } catch (error) {
        console.error(`删除历史记录 ${id} 失败:`, error)
        return false
    }
}

export const clearAllHistory = async (): Promise<boolean> => {
    try {
        await api.delete('/history')
        cachedRecords = null
        return true
    } catch (error) {
        console.error('清空历史记录失败:', error)
        return false
    }
}

export const createHistoryRecord = async (
    data: Omit<HistoryRecord, 'id' | 'timestamp'>
): Promise<HistoryRecord | null> => {
    try {
        const response = await api.post('/history', data)
        cachedRecords = null
        return response.data
    } catch (error) {
        console.error('创建历史记录失败:', error)
        return null
    }
}

/**
 * 添加历史记录的简化函数
 */
export const addHistoryRecord = async (
    record: Partial<HistoryRecord>
): Promise<void> => {
    try {
        // 确保时间戳始终是数字类型
        const serializedRecord = {
            ...record,
            timestamp:
                typeof record.timestamp === 'number'
                    ? record.timestamp
                    : Date.now(),
            // 确保结果是有效的JSON
            result: record.result
                ? JSON.parse(JSON.stringify(record.result))
                : {},
        }

        await createHistoryRecord(
            serializedRecord as Omit<HistoryRecord, 'id' | 'timestamp'>
        )
        // 清除缓存
        cachedRecords = null
    } catch (error) {
        console.error('保存历史记录失败:', error)
    }
}

/**
 * React Hook: 使用历史记录
 */
export const useHistory = (type?: 'image' | 'video') => {
    const [records, setRecords] = useState<HistoryRecord[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchRecords = useCallback(
        async (forceRefresh = false) => {
            setLoading(true)
            setError(null)
            try {
                const data = await getHistoryRecords(type, forceRefresh)
                setRecords(data)
            } catch (error) {
                console.error('获取历史记录失败:', error)
                setError('无法加载历史记录')
            } finally {
                setLoading(false)
            }
        },
        [type]
    )

    useEffect(() => {
        fetchRecords(false)
    }, [fetchRecords])

    const deleteRecord = useCallback(async (id: string) => {
        try {
            const success = await deleteHistoryRecord(id)
            if (success) {
                setRecords((prev) => prev.filter((record) => record.id !== id))
            }
            return success
        } catch (error) {
            console.error('删除历史记录失败:', error)
            return false
        }
    }, [])

    const clearAllRecords = useCallback(async () => {
        try {
            const success = await clearAllHistory()
            if (success) {
                setRecords([])
            }
            return success
        } catch (error) {
            console.error('清除所有历史记录失败:', error)
            return false
        }
    }, [])

    return {
        records,
        loading,
        error,
        refreshRecords: fetchRecords,
        deleteRecord,
        clearAllRecords,
    }
}
