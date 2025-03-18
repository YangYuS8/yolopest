import axios from 'axios'
import { message } from 'antd'

// 请求拦截器 - 添加认证令牌
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// 响应拦截器 - 处理错误
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status

        if (status === 401) {
            message.error('请先登录或会话已过期')
            localStorage.removeItem('accessToken')
            window.location.href = '/login'
        } else if (status === 403) {
            message.error('您没有权限执行此操作')
        } else if (status === 404) {
            message.error('请求的资源不存在')
        } else if (status >= 500) {
            message.error('服务器错误，请稍后再试')
        } else {
            message.error(error.response?.data?.detail || '操作失败')
        }

        return Promise.reject(error)
    }
)

// 初始化默认认证头
const token = localStorage.getItem('accessToken')
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}
