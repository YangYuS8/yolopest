import axios from 'axios'
import { showError } from './notificationService'

export const handleApiError = (
    error: unknown,
    defaultMessage: string
): void => {
    if (axios.isAxiosError(error)) {
        const response = error.response
        if (response?.data?.message) {
            showError(response.data.message)
        } else if (response?.status === 401) {
            showError('未授权访问')
        } else if (response?.status === 403) {
            showError('没有权限执行此操作')
        } else if (response?.status === 404) {
            showError('请求的资源不存在')
        } else if (response?.status === 500) {
            showError('服务器错误，请稍后再试')
        } else {
            showError(defaultMessage)
        }
    } else if (error instanceof Error) {
        showError(error.message || defaultMessage)
    } else {
        showError(defaultMessage)
    }
}

export const getFriendlyErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        // HTTP错误
        const status = error.response?.status

        if (status === 401) return '登录已过期，请重新登录'
        if (status === 403) return '您没有权限执行此操作'
        if (status === 404) return '请求的资源不存在'
        if (status === 500) return '服务器内部错误，请稍后再试'

        // 尝试获取后端的详细错误信息
        if (error.response?.data?.detail) {
            const detail = error.response.data.detail
            return typeof detail === 'string' ? detail : JSON.stringify(detail)
        }

        return error.message || '请求失败'
    }

    // 非HTTP错误
    if (error instanceof Error) {
        return error.message
    }

    return '发生未知错误'
}
