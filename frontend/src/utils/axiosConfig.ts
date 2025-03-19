import axios from 'axios'
import { handleApiError } from './errorHandler'

// 检查并确保baseURL配置正确
const api = axios.create({
    baseURL: 'http://localhost:8000/api', // 确保这与后端路由匹配
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// 添加请求拦截器，自动附加token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
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
