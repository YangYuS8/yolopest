import React from 'react'
import { Radio } from 'antd'
import {
    AreaChartOutlined,
    LineChartOutlined,
    BarChartOutlined,
} from '@ant-design/icons'

export type ChartViewMode = 'area' | 'line' | 'bar'

interface ChartViewSwitcherProps {
    viewMode: ChartViewMode
    onChange: (mode: ChartViewMode) => void
    showArea?: boolean
    showLine?: boolean
    showBar?: boolean
}

export const ChartViewSwitcher: React.FC<ChartViewSwitcherProps> = ({
    viewMode,
    onChange,
    showArea = true,
    showLine = true,
    showBar = true,
}) => {
    return (
        // 移除Space组件和marginBottom
        <Radio.Group
            size="small"
            value={viewMode}
            onChange={(e) => onChange(e.target.value)}
            style={{
                // 调整整体样式以匹配其他控件
                display: 'inline-flex',
                alignItems: 'center',
            }}
            buttonStyle="solid" // 使用实心风格，更像按钮
        >
            {showArea && (
                <Radio.Button
                    value="area"
                    style={{
                        height: 24,
                        padding: '0 8px',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <AreaChartOutlined /> 区域图
                </Radio.Button>
            )}
            {showLine && (
                <Radio.Button
                    value="line"
                    style={{
                        height: 24,
                        padding: '0 8px',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <LineChartOutlined /> 折线图
                </Radio.Button>
            )}
            {showBar && (
                <Radio.Button
                    value="bar"
                    style={{
                        height: 24,
                        padding: '0 8px',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <BarChartOutlined /> 柱状图
                </Radio.Button>
            )}
        </Radio.Group>
    )
}
