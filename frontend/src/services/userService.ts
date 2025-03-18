import api from '../utils/axiosConfig'
import { UserResponse, UpdateProfileRequest } from '../types/user'

// 更新用户资料
export const updateUserProfile = async (
    userId: string,
    data: UpdateProfileRequest
): Promise<UserResponse> => {
    const response = await api.patch<UserResponse>(`/users/${userId}`, data)
    return response.data
}

// 获取所有用户（管理员）
export const getAllUsers = async (): Promise<UserResponse[]> => {
    const response = await api.get<UserResponse[]>('/users')
    return response.data
}

// 删除用户（管理员）
export const deleteUser = async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}`)
}
