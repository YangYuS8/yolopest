import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { handleApiError } from '../utils/errorHandler'
import { message } from 'antd'
import { FormBaseType } from '../types/form'

interface LocationState {
    message?: string
}

interface AuthFormHookReturn {
    loading: boolean
    error: string | null
    handleSubmit: <T extends FormBaseType>(
        authAction: (values: T) => Promise<unknown>,
        values: T,
        successMessage?: string,
        redirectTo?: string
    ) => Promise<void>
    state: LocationState | null
}

export function useAuthForm(defaultRedirect: string = '/'): AuthFormHookReturn {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()
    const location = useLocation()
    const state = location.state as LocationState | null

    const handleSubmit = async <T extends FormBaseType>(
        authAction: (values: T) => Promise<unknown>,
        values: T,
        successMessage: string = '操作成功',
        redirectTo: string = defaultRedirect
    ): Promise<void> => {
        setError(null)
        setLoading(true)

        try {
            await authAction(values)
            message.success(successMessage)
            navigate(redirectTo, { state: { message: successMessage } })
        } catch (err: unknown) {
            const errorDetails = handleApiError(err)
            setError(errorDetails.message)
        } finally {
            setLoading(false)
        }
    }

    return {
        loading,
        error,
        handleSubmit,
        state,
    }
}
