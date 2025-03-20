import React, { useState, useEffect } from 'react'
import { UserResponse } from '../types/user'
import {
    getCurrentUser,
    login,
    logout,
    register,
} from '../services/authService'
import { AuthContext, AuthContextType } from './authTypes'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<UserResponse | null>(null)
    const [loading, setLoading] = useState(true)

    const refreshUser = async () => {
        try {
            const userData = await getCurrentUser()
            setUser(userData)
        } catch (error) {
            console.error('获取用户信息失败', error)
        } finally {
            setLoading(false)
        }
    }

    // 组件加载时获取用户信息
    useEffect(() => {
        refreshUser()
    }, [])

    const handleLogin = async (email: string, password: string) => {
        try {
            await login(email, password) // 修复未使用的变量
            await refreshUser()
            return true
        } catch (error) {
            console.error('登录失败', error)
            return false
        }
    }

    const handleRegister = async (
        email: string,
        password: string,
        username: string
    ) => {
        try {
            await register(email, password, username)
            return true
        } catch (error) {
            console.error('注册失败', error)
            return false
        }
    }

    const handleLogout = () => {
        logout()
        setUser(null)
    }

    // 提供给消费组件的值
    const value: AuthContextType = {
        user,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        refreshUser,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
