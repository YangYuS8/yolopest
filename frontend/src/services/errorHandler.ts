import axios from 'axios'
import { showError } from './notificationService'

export const handleApiError = (error: unknown, customMessage?: string) => {
    if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
            showError(customMessage || '请求参数有误，请检查后重试')
        } else if (error.response?.status === 401) {
            showError('未授权访问，请先登录')
        } else if (error.response?.status === 404) {
            showError('请求的资源不存在')
        } else if (error.response?.status === 500) {
            showError('服务器错误，请稍后重试')
        } else {
            showError(customMessage || '请求失败，请重试')
        }
        console.error('API错误:', error)
    } else {
        showError(customMessage || '发生未知错误')
        console.error('未知错误:', error)
    }
}
