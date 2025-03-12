import { notification } from 'antd'

type NotificationType = 'success' | 'info' | 'warning' | 'error'

const showNotification = (
    type: NotificationType,
    message: string,
    description?: string
) => {
    notification[type]({
        message,
        description,
        placement: 'topRight',
    })
}

export const showSuccess = (message: string, description?: string) => {
    showNotification('success', message, description)
}

export const showInfo = (message: string, description?: string) => {
    showNotification('info', message, description)
}

export const showWarning = (message: string, description?: string) => {
    showNotification('warning', message, description)
}

export const showError = (message: string, description?: string) => {
    showNotification('error', message, description)
}
