import api from '../utils/axiosConfig'
import { isAxiosError } from 'axios'
import type { TokenResponse, UserResponse } from '../types/user'

// 登录 - 不再使用完整 URL 拼接
export const login = async (
    email: string,
    password: string
): Promise<TokenResponse> => {
    try {
        // 创建表单数据
        const formData = new URLSearchParams()
        formData.append('username', email)
        formData.append('password', password)

        const response = await api.post('/auth/login', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })

        // 处理响应...
        const { access_token } = response.data
        localStorage.setItem('accessToken', access_token)
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`

        return response.data
    } catch (error) {
        console.error('登录失败', error)
        throw error
    }
}

// 注册 - 不再使用完整 URL 拼接
export const register = async (
    email: string,
    password: string,
    username: string
): Promise<UserResponse> => {
    const response = await api.post<UserResponse>('/auth/register', {
        email,
        password,
        username,
    })
    return response.data
}

// 获取当前用户信息
export const getCurrentUser = async (): Promise<UserResponse | null> => {
    // 检查是否有 token
    const token = localStorage.getItem('accessToken')
    if (!token) return null

    try {
        const response = await api.get<UserResponse>('/users/me')
        return response.data
    } catch (error) {
        console.error('获取用户信息失败', error)
        // 如果是401错误，清除无效token
        if (isAxiosError(error) && error.response?.status === 401) {
            console.log('Token无效或已过期，正在清除...')
            logout() // 自动登出，清除无效token
        }
        return null
    }
}

// 修改密码
export const updatePassword = async (
    currentPassword: string,
    newPassword: string
): Promise<void> => {
    await api.patch('/users/me/password', {
        current_password: currentPassword,
        new_password: newPassword,
    })
}

// 登出
export const logout = (): void => {
    localStorage.removeItem('accessToken')
    delete api.defaults.headers.common['Authorization']
}

// 检查是否已登录
export const isAuthenticated = (): boolean => {
    return !!localStorage.getItem('accessToken')
}
