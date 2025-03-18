// 所有 auth.ts 文件中的方法都应该使用 api 实例

import api from '../utils/axiosConfig'
import { UserResponse } from '../types/user'

// 登录
export const login = async (
    email: string,
    password: string
): Promise<{ access_token: string; token_type: string }> => {
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)

    const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    // 将令牌存储在本地存储中
    if (response.data.access_token) {
        localStorage.setItem('accessToken', response.data.access_token)
        api.defaults.headers.common['Authorization'] =
            `Bearer ${response.data.access_token}`
    }

    return response.data
}

// 注册
export const register = async (
    email: string,
    password: string,
    username: string
): Promise<UserResponse> => {
    const response = await api.post('/auth/register', {
        email,
        password,
        username,
    })
    return response.data
}

// 获取当前用户信息，完全省略catch中的参数声明
export const getCurrentUser = async (): Promise<UserResponse | null> => {
    try {
        const response = await api.get('/users/me')
        return response.data
    } catch {
        console.error('获取用户信息失败')
        return null
    }
}

// 登出
export const logout = (): void => {
    localStorage.removeItem('accessToken')
    delete api.defaults.headers.common['Authorization']
}
