import React, { useState } from 'react'
import { Button, Dropdown } from 'antd'
import { DownloadOutlined, DownOutlined } from '@ant-design/icons'
import type { MenuInfo } from 'rc-menu/lib/interface'

interface EnhancedChartDownloadButtonProps {
    containerSelector: string
    fileNamePrefix: string
    data?: Record<string, unknown>[]
    csvHeaders?: string[]
}

type ExportFormat = 'png' | 'jpg' | 'csv' | 'svg'

export const EnhancedChartDownloadButton: React.FC<
    EnhancedChartDownloadButtonProps
> = ({ containerSelector, fileNamePrefix, data, csvHeaders }) => {
    const [format, setFormat] = useState<ExportFormat>('png')

    const exportChart = () => {
        const currentDate = new Date().toISOString().split('T')[0]
        const fileName = `${fileNamePrefix}_${currentDate}`

        switch (format) {
            case 'png':
            case 'jpg': {
                // 导出图片
                const chartCanvas = document
                    .querySelector(containerSelector)
                    ?.querySelector('canvas')

                if (chartCanvas) {
                    const link = document.createElement('a')
                    link.download = `${fileName}.${format}`
                    link.href = chartCanvas.toDataURL(`image/${format}`)
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                }
                break
            }
            case 'csv': {
                // 导出CSV
                if (data && data.length > 0) {
                    const headers = csvHeaders || Object.keys(data[0])
                    const csvContent =
                        'data:text/csv;charset=utf-8,' +
                        headers.join(',') +
                        '\n' +
                        data
                            .map((row) =>
                                headers
                                    .map((header) => String(row[header]))
                                    .join(',')
                            )
                            .join('\n')

                    const encodedUri = encodeURI(csvContent)
                    const link = document.createElement('a')
                    link.setAttribute('href', encodedUri)
                    link.setAttribute('download', `${fileName}.csv`)
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                }
                break
            }
            case 'svg': {
                // 导出SVG
                const svgElement = document
                    .querySelector(containerSelector)
                    ?.querySelector('svg')

                if (svgElement) {
                    const svgData = new XMLSerializer().serializeToString(
                        svgElement
                    )
                    const svgBlob = new Blob([svgData], {
                        type: 'image/svg+xml;charset=utf-8',
                    })
                    const svgUrl = URL.createObjectURL(svgBlob)
                    const link = document.createElement('a')
                    link.href = svgUrl
                    link.download = `${fileName}.svg`
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    URL.revokeObjectURL(svgUrl)
                }
                break
            }
        }
    }

    const items = [
        { key: 'png', label: 'PNG 图片' },
        { key: 'jpg', label: 'JPG 图片' },
        ...(data && data.length > 0 ? [{ key: 'csv', label: 'CSV 数据' }] : []),
        { key: 'svg', label: 'SVG 矢量图' },
    ]

    const handleMenuClick = (info: MenuInfo) => {
        setFormat(info.key as ExportFormat)
    }

    return (
        <Dropdown menu={{ items, onClick: handleMenuClick }}>
            <Button
                icon={<DownloadOutlined />}
                onClick={exportChart}
                size="small"
            >
                导出 <DownOutlined />
            </Button>
        </Dropdown>
    )
}
