import React from 'react'
import { Card, Row, Col, DatePicker, Radio } from 'antd'
import {
    AreaChartOutlined,
    BarChartOutlined,
    PieChartOutlined,
    CheckCircleOutlined,
    LineChartOutlined,
    SwapOutlined,
} from '@ant-design/icons'
import type { RangePickerProps } from 'antd/es/date-picker'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

interface StatisticsHeaderProps {
    dateRange: [dayjs.Dayjs, dayjs.Dayjs]
    chartType: string
    onDateRangeChange: RangePickerProps['onChange']
    onChartTypeChange: (chartType: string) => void
}

export const StatisticsHeader: React.FC<StatisticsHeaderProps> = ({
    dateRange,
    chartType,
    onDateRangeChange,
    onChartTypeChange,
}) => {
    const radioGroupStyle: React.CSSProperties = {
        position: 'relative',
        zIndex: 0,
    }

    const cardStyle: React.CSSProperties = {
        overflow: 'hidden',
        marginBottom: 16,
    }

    return (
        <Card style={cardStyle}>
            <Row gutter={[16, 16]} justify="space-between" align="middle">
                <Col>
                    <Radio.Group
                        value={chartType}
                        onChange={(e) => onChartTypeChange(e.target.value)}
                        buttonStyle="solid"
                        style={radioGroupStyle}
                    >
                        <Radio.Button value="trend">
                            <AreaChartOutlined /> 趋势分析
                        </Radio.Button>
                        <Radio.Button value="distribution">
                            <PieChartOutlined /> 害虫分布
                        </Radio.Button>
                        <Radio.Button value="confidence">
                            <BarChartOutlined /> 置信度分析
                        </Radio.Button>
                        <Radio.Button value="accuracy">
                            <CheckCircleOutlined /> 精确度分析
                        </Radio.Button>
                        <Radio.Button value="spatial">
                            <AreaChartOutlined /> 空间分布
                        </Radio.Button>
                        <Radio.Button value="prediction">
                            <LineChartOutlined /> 趋势预测
                        </Radio.Button>
                        <Radio.Button value="comparison">
                            <SwapOutlined /> 环比分析
                        </Radio.Button>
                    </Radio.Group>
                </Col>
                <Col>
                    <RangePicker
                        value={dateRange}
                        onChange={onDateRangeChange}
                        allowClear={false}
                    />
                </Col>
            </Row>
        </Card>
    )
}
