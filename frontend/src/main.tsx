import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <ConfigProvider
                locale={zhCN}
                theme={{
                    // 使用预设的"紧凑"主题
                    token: {
                        colorPrimary: '#1890ff',
                        borderRadius: 6,
                        fontSize: 14,
                    },
                    components: {
                        Button: {
                            // 更合理的按钮尺寸
                            paddingInlineSM: 12,
                            paddingInline: 16,
                            paddingInlineLG: 24,
                        },
                        Card: {
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                        },
                        Layout: {
                            headerBg: '#001529',
                        },
                    },
                }}
            >
                <AuthProvider>
                    <App />
                </AuthProvider>
            </ConfigProvider>
        </BrowserRouter>
    </React.StrictMode>
)
