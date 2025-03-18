export interface User {
    id: string
    email: string
    username: string
    is_active: boolean
    is_superuser: boolean
    created_at: string
}

// 避免 "接口未声明成员等同于其超类型" 错误
export type UserResponse = User & {
    // 此处可以添加将来可能需要的额外字段
    // 使用这种写法可以避免空接口错误
}

export interface TokenResponse {
    access_token: string
    token_type: string
}

export interface LoginRequest {
    email: string
    password: string
}

export interface RegisterRequest {
    email: string
    username: string
    password: string
}

export interface UpdateProfileRequest {
    username?: string
    email?: string
}

export interface UpdatePasswordRequest {
    current_password: string
    new_password: string
}
