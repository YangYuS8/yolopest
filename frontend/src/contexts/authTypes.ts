import { createContext } from 'react'
import { UserResponse } from '../types/user'

export interface AuthContextType {
    user: UserResponse | null
    loading: boolean
    login: (email: string, password: string) => Promise<boolean>
    register: (
        email: string,
        password: string,
        username: string
    ) => Promise<boolean>
    logout: () => void
    refreshUser: () => Promise<void>
}

// 将 Context 创建移至此处
export const AuthContext = createContext<AuthContextType | undefined>(undefined)
