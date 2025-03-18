import api from '../utils/axiosConfig'
import type { TokenResponse, UserResponse } from '../types/user'

// 登录 - 不再使用完整 URL 拼接
export const login = async (
    email: string,
    password: string
): Promise<TokenResponse> => {
    const formData = new URLSearchParams()
    formData.append('username', email) // FastAPI Users 使用 username 作为参数名
    formData.append('password', password)

    const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    // 保存token到localStorage
    if (response.data.access_token) {
        localStorage.setItem('accessToken', response.data.access_token)
        api.defaults.headers.common['Authorization'] =
            `Bearer ${response.data.access_token}`
    }

    return response.data
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
        // 使用正确的用户端点
        const response = await api.get<UserResponse>('/users/me')
        return response.data
    } catch (error) {
        console.error('获取用户信息失败', error)
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
