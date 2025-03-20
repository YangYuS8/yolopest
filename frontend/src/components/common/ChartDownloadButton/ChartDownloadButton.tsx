import React from 'react'
import { Button, ButtonProps, Tooltip } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'

interface ChartDownloadButtonProps extends Omit<ButtonProps, 'onClick'> {
    /**
     * 图表容器的CSS选择器
     */
    containerSelector: string
    /**
     * 下载文件的前缀名称
     */
    fileNamePrefix?: string
    /**
     * 提示内容
     */
    tooltipTitle?: string
    /**
     * 按钮文本
     */
    buttonText?: string
}

export const ChartDownloadButton: React.FC<ChartDownloadButtonProps> = ({
    containerSelector,
    fileNamePrefix = '图表导出',
    tooltipTitle = '下载图表为PNG图片',
    buttonText = '导出图片',
    ...buttonProps
}) => {
    const downloadImage = () => {
        const chartCanvas = document
            .querySelector(containerSelector)
            ?.querySelector('canvas')

        if (chartCanvas) {
            const link = document.createElement('a')
            link.download = `${fileNamePrefix}_${new Date().toISOString().split('T')[0]}.png`
            link.href = chartCanvas.toDataURL('image/png')
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }

    return (
        <Tooltip title={tooltipTitle}>
            <Button
                icon={<DownloadOutlined />}
                size="small"
                onClick={downloadImage}
                {...buttonProps}
            >
                {buttonText}
            </Button>
        </Tooltip>
    )
}
