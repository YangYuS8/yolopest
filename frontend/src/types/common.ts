import { ReactNode } from 'react'

// 通用组件 Props 类型
export interface CommonProps {
    className?: string
    style?: React.CSSProperties
    children?: ReactNode
}

// 异步操作状态
export interface AsyncState<T = unknown> {
    data: T | null
    loading: boolean
    error: string | null
}

// API响应类型
export interface ApiResponse<T = unknown> {
    success: boolean
    data?: T
    message?: string
    error?: string
}

// 分页数据类型
export interface PaginatedData<T> {
    items: T[]
    total: number
    page: number
    size: number
    pages: number
}

// 表单相关类型
export type FormErrors = Record<string, string[]>

export interface FormState {
    submitting: boolean
    errors: FormErrors | null
    success: boolean
}
