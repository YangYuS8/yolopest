/**
 * 统一的图表主题配置
 */
export const ChartTheme = {
    colors: {
        primary: [
            '#0088FE',
            '#00C49F',
            '#FFBB28',
            '#FF8042',
            '#8884d8',
            '#82ca9d',
            '#ffc658',
            '#8dd1e1',
        ],
        trend: {
            area: '#1890ff66',
            line: '#1890ff',
            positive: '#cf1322',
            negative: '#3f8600',
        },
        confidence: (value: number) =>
            `rgba(82, 196, ${30 + value * 225}, 0.85)`,
    },
    margin: {
        default: { top: 20, right: 30, left: 20, bottom: 30 },
        compact: { top: 10, right: 20, left: 10, bottom: 20 },
        withXLabel: { top: 20, right: 30, left: 20, bottom: 40 },
        withYLabel: { top: 20, right: 30, left: 40, bottom: 30 },
        withBothLabels: { top: 20, right: 30, left: 40, bottom: 40 },
    },
    axisStyle: {
        stroke: '#E0E0E0',
        strokeDasharray: '3 3',
        fontSize: 12,
    },
    tooltipStyle: {
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '6px 8px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
    },
    labelStyle: {
        fontSize: 14,
        fontWeight: 'bold',
        fill: '#000000',
    },
    animation: {
        default: {
            isAnimationActive: true,
            animationBegin: 0,
            animationDuration: 1000,
            animationEasing: 'ease-out',
        },
        none: {
            isAnimationActive: false,
        },
    },
    responsiveHeight: {
        small: 300,
        default: 400,
        large: 500,
    },
}

/**
 * 获取特定图表类型的通用配置
 */
export const getChartConfig = (
    chartType: 'line' | 'area' | 'bar' | 'pie' | 'scatter'
) => {
    // 基础配置
    const baseConfig = {
        margin: ChartTheme.margin.default,
        animation: ChartTheme.animation.default,
    }

    // 根据图表类型返回特定配置
    switch (chartType) {
        case 'pie':
            return {
                ...baseConfig,
                innerRadius: 60,
                outerRadius: 80,
                paddingAngle: 5,
                label: {
                    formatter: (entry: { name: string; percent: number }) =>
                        `${entry.name}: ${(entry.percent * 100).toFixed(1)}%`,
                    ...ChartTheme.labelStyle,
                },
            }

        case 'line':
        case 'area':
            return {
                ...baseConfig,
                margin: ChartTheme.margin.withBothLabels,
                cartesianGrid: {
                    strokeDasharray: ChartTheme.axisStyle.strokeDasharray,
                    stroke: ChartTheme.axisStyle.stroke,
                },
                dot: { r: 4 },
                activeDot: { r: 6 },
                strokeWidth: 3,
            }

        case 'bar':
            return {
                ...baseConfig,
                margin: ChartTheme.margin.withBothLabels,
                barRadius: [8, 8, 0, 0],
                cartesianGrid: {
                    strokeDasharray: ChartTheme.axisStyle.strokeDasharray,
                    stroke: ChartTheme.axisStyle.stroke,
                },
            }

        case 'scatter':
            return {
                ...baseConfig,
                margin: ChartTheme.margin.withBothLabels,
                cartesianGrid: {
                    strokeDasharray: ChartTheme.axisStyle.strokeDasharray,
                    stroke: ChartTheme.axisStyle.stroke,
                },
            }

        default:
            return baseConfig
    }
}
