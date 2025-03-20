import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import AppLayout from './components/layout/AppLayout/AppLayout'
import HomePage from './pages/Home'
import LoginPage from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import ImageDetection from './pages/ImageDetection'
import VideoDetection from './pages/VideoDetection'
import Statistics from './pages/Statistics'
import History from './pages/History'

import './App.css'

// 受保护的路由组件
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth()

    if (loading) return <div>加载中...</div>
    if (!user) return <Navigate to="/login" />

    return <>{children}</>
}

const App: React.FC = () => {
    return (
        <AppLayout>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<HomePage />} />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/image-detection"
                    element={
                        <ProtectedRoute>
                            <ImageDetection />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/video-detection"
                    element={
                        <ProtectedRoute>
                            <VideoDetection />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/statistics"
                    element={
                        <ProtectedRoute>
                            <Statistics />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/history"
                    element={
                        <ProtectedRoute>
                            <History />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </AppLayout>
    )
}

export default App
