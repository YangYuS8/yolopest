import React, { ReactNode } from 'react'
import { Space, Tooltip, Card } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
// 使用增强版下载按钮替代基础版本
import { EnhancedChartDownloadButton } from '../../common/ChartDownloadButton/EnhancedChartDownloadButton'

interface BaseChartContainerProps {
    /** 图表标题 */
    title: string
    /** 提示信息 */
    tooltip?: string
    /** 容器CSS选择器，用于导出图表 */
    containerSelector: string
    /** 导出文件名前缀 */
    fileNamePrefix: string
    /** 图表内容 */
    children: ReactNode
    /** 图表高度 */
    height?: number | string
    /** 附加操作按钮 */
    extraActions?: ReactNode
    /** 原始数据，用于CSV导出 */
    rawData?: Record<string, unknown>[]
    /** CSV表头 */
    csvHeaders?: string[]
    /** 是否包装在Card中 */
    inCard?: boolean
    /** 底部内容 */
    footer?: ReactNode
}

export const BaseChartContainer: React.FC<BaseChartContainerProps> = ({
    title,
    tooltip,
    containerSelector,
    fileNamePrefix,
    children,
    height = 400,
    extraActions,
    rawData,
    csvHeaders,
    inCard = false,
    footer,
}) => {
    const content = (
        <>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20,
                }}
            >
                <h3 style={{ margin: 0 }}>{title}</h3>
                <Space>
                    {tooltip && (
                        <Tooltip title={tooltip}>
                            <InfoCircleOutlined />
                        </Tooltip>
                    )}
                    {extraActions}
                    <EnhancedChartDownloadButton
                        containerSelector={containerSelector}
                        fileNamePrefix={fileNamePrefix}
                        data={rawData}
                        csvHeaders={csvHeaders}
                    />
                </Space>
            </div>

            <div
                className={containerSelector.replace('.', '')}
                style={{ width: '100%', height }}
            >
                {children}
            </div>

            {footer && <div style={{ marginTop: 16 }}>{footer}</div>}
        </>
    )

    return inCard ? <Card>{content}</Card> : content
}
