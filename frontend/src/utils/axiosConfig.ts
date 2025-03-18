import axios from 'axios'
import { handleApiError } from './errorHandler'

// 创建 axios 实例
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
})

// 请求拦截器
api.interceptors.request.use(
    (config) => {
        // 从本地存储获取 token
        const token = localStorage.getItem('accessToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 响应拦截器
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // 使用错误处理工具
        handleApiError(error)
        return Promise.reject(error)
    }
)

export default api
