import { useState, useEffect } from 'react'
import { UserResponse } from '../types/user'
import {
    getCurrentUser,
    login,
    logout,
    register,
} from '../services/authService'

export const useAuth = () => {
    const [user, setUser] = useState<UserResponse | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getCurrentUser()
                setUser(userData)
            } catch (error) {
                console.error('获取用户信息失败', error)
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [])

    const loginUser = async (email: string, password: string) => {
        try {
            await login(email, password)
            const userData = await getCurrentUser()
            setUser(userData)
            return true
        } catch (error) {
            console.error('登录失败', error)
            return false
        }
    }

    const registerUser = async (
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

    const logoutUser = () => {
        logout()
        setUser(null)
    }

    return {
        user,
        loading,
        loginUser,
        registerUser,
        logoutUser,
        isAuthenticated: !!user,
    }
}
