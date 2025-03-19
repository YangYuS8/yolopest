import api from '../utils/axiosConfig'
import { useState, useCallback, useEffect } from 'react'
import { HistoryRecord } from '../types/history' // 使用导入的类型，删除本地定义

// 缓存设置
const CACHE_TTL = 60000 // 1分钟缓存
let cachedRecords: HistoryRecord[] | null = null
let lastFetchTime = 0

/**
 * 获取历史记录
 * 支持可选的类型过滤和强制刷新缓存
 */
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

        // 根据是否有type参数决定API路径
        const endpoint = '/history/'
        const params = type ? { type } : undefined
        const response = await api.get(endpoint, { params })

        cachedRecords = response.data
        lastFetchTime = Date.now()
        return response.data
    } catch (error) {
        console.error('获取历史记录失败:', error)
        return []
    }
}

// 其他单个记录操作函数
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
    // 现有实现...
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
    record: HistoryRecord
): Promise<void> => {
    await api.post('/history/', record)
    // 清除缓存，确保下次获取记录时能获取最新数据
    cachedRecords = null
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
                // 确保传递正确的参数
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
                // 如果删除成功，更新本地记录列表
                setRecords((prev) => prev.filter((record) => record.id !== id))
            }
            return success
        } catch (error) {
            console.error(`删除历史记录 ${id} 失败:`, error)
            setError('删除历史记录失败')
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
            setError('清除历史记录失败')
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
