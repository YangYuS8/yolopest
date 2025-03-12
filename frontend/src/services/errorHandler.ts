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
