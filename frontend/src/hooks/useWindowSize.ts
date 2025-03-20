import { useState, useEffect } from 'react'

interface WindowSize {
    width: number
    height: number
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
}

export function useWindowSize(): WindowSize {
    // 默认服务器端渲染值
    const [windowSize, setWindowSize] = useState<WindowSize>({
        width: 1200,
        height: 800,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
    })

    useEffect(() => {
        function handleResize() {
            const width = window.innerWidth
            const height = window.innerHeight
            setWindowSize({
                width,
                height,
                isMobile: width < 768,
                isTablet: width >= 768 && width < 1024,
                isDesktop: width >= 1024,
            })
        }

        // 添加事件监听
        window.addEventListener('resize', handleResize)

        // 初始调用
        handleResize()

        // 清理函数
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return windowSize
}
