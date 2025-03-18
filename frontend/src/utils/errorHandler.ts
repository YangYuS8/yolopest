import axios, { AxiosError } from 'axios'
import { message } from 'antd'

// 标准化错误处理
export const handleApiError = (
    error: unknown
): { message: string; details?: unknown } => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{
            detail?: string
            message?: string
        }>
        const errorMessage =
            axiosError.response?.data?.detail ||
            axiosError.response?.data?.message ||
            '请求发生错误'

        return { message: errorMessage, details: axiosError.response?.data }
    }

    // 处理非Axios错误
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    return { message: errorMessage, details: error }
}

// 全局通知错误
export const showErrorMessage = (error: unknown): void => {
    const { message: errorMessage } = handleApiError(error)
    message.error(errorMessage)
}
