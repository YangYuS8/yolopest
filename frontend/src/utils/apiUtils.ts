import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

interface ApiRequestOptions extends AxiosRequestConfig {
    url: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    data?: Record<string, unknown>
    params?: Record<string, unknown>
}

interface ApiResponse<T = Record<string, unknown>> {
    status: string
    data?: T
    error?: string
    message?: string
}

/**
 * 通用API请求函数
 */
export const apiRequest = async <T = Record<string, unknown>>(
    options: ApiRequestOptions
): Promise<ApiResponse<T>> => {
    try {
        const response: AxiosResponse = await axios({
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            // 携带认证信息
            withCredentials: true,
        })

        // 将后端响应封装在data字段
        return {
            status: response.data.status || 'success',
            data: response.data, // 整个后端响应作为data字段
            message: response.data.message || '',
            error: response.data.error || '',
        }
    } catch (error: unknown) {
        // 处理错误
        if (axios.isAxiosError(error) && error.response) {
            // 服务器返回错误响应
            console.error('API请求错误:', error.response.data)
            throw new Error(
                (error.response.data as { detail?: string }).detail ||
                    '请求失败'
            )
        } else if (axios.isAxiosError(error) && error.request) {
            // 请求发送但未收到响应
            console.error('无法连接服务器:', error.request)
            throw new Error('无法连接服务器，请检查网络连接')
        } else {
            // 请求设置时发生错误
            const errorMessage =
                error instanceof Error ? error.message : '请求错误'
            console.error('请求错误:', errorMessage)
            throw new Error(errorMessage)
        }
    }
}
