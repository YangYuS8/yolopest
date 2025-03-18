// 基础表单类型，使用索引签名
export interface FormBaseType {
    [key: string]: unknown
}

// 登录表单类型
export interface LoginFormValues extends FormBaseType {
    email: string
    password: string
}

// 注册表单类型
export interface RegisterFormValues extends FormBaseType {
    email: string
    username: string
    password: string
    confirm: string
}

// 更新密码表单类型
export interface UpdatePasswordFormValues extends FormBaseType {
    current_password: string
    new_password: string
    confirm_password: string
}

// 更新个人资料表单类型
export interface UpdateProfileFormValues extends FormBaseType {
    username: string
    email: string
}
