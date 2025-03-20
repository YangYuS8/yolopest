import { useContext } from 'react'
import { AuthContext, AuthContextType } from '../contexts/authTypes' // 从这里导入

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth 必须在 AuthProvider 内部使用')
    }
    return context
}
