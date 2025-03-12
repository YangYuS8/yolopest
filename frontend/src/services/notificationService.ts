import { message, notification } from 'antd'

export const showSuccess = (msg: string) => {
    message.success(msg)
}

export const showError = (msg: string) => {
    message.error(msg)
}

export const showWarning = (msg: string) => {
    message.warning(msg)
}

export const showInfo = (msg: string) => {
    message.info(msg)
}

export const showNotification = (
    title: string,
    description: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'info'
) => {
    notification[type]({
        message: title,
        description,
    })
}
