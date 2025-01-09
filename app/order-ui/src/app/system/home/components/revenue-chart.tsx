import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import moment from 'moment'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { useRevenue } from '@/hooks'
import { formatCurrency, formatShortCurrency } from '@/utils'

interface RevenueData {
    startDate: string
    endDate: string
}

interface TooltipParams {
    name: string;
    value: number;
    seriesName: string;
}

export default function RevenueChart({ startDate, endDate }: RevenueData) {
    const chartRef = useRef<HTMLDivElement>(null)

    const { data: revenueData } = useRevenue({
        startDate,
        endDate,
    })

    useEffect(() => {
        if (chartRef.current && revenueData?.result) {
            const chart = echarts.init(chartRef.current)

            // Ensure we're working with an array and sort it
            const sortedData = Array.isArray(revenueData.result)
                ? [...revenueData.result].sort((a, b) =>
                    moment(a.date).valueOf() - moment(b.date).valueOf()
                )
                : [];

            const option = {
                tooltip: {
                    trigger: 'axis' as const,
                    formatter: function (params: TooltipParams[]) {
                        const date = params[0].name
                        const revenue = formatCurrency(params[0].value)
                        const orders = params[1].value
                        return `${date}<br/>${params[0].seriesName}: ${revenue}<br/>${params[1].seriesName}: ${orders}`
                    }
                },
                legend: {
                    data: ['Doanh thu', 'Đơn hàng']
                },
                xAxis: {
                    type: 'category',
                    data: sortedData.map(item => moment(item.date).format('DD/MM')),
                    axisLabel: {
                        rotate: 45
                    }
                },
                yAxis: [
                    {
                        type: 'value',
                        name: 'Doanh thu (nghìn đồng)',
                        position: 'left',
                        nameTextStyle: {
                            padding: [0, -50, 0, 0], // Tăng padding bên trái
                        },
                        axisLabel: {
                            formatter: (value: number) => formatShortCurrency(value),
                            margin: 4, // Tăng khoảng cách giữa nhãn và trục
                            show: true,
                        },
                        axisLine: {
                            show: true
                        },
                        nameGap: 15, // Khoảng cách giữa tên trục và trục
                        offset: 0, // Dịch chuyển trục
                        splitLine: {
                            show: true,
                            lineStyle: {
                                type: 'dashed'
                            }
                        }
                    },
                    {
                        type: 'value',
                        name: 'Đơn hàng',
                        position: 'right',
                        // nameTextStyle: {
                        //     padding: [0, 0, 0, 0], // Tăng padding bên phải
                        // },
                        axisLabel: {
                            show: true,
                            margin: 4,
                        },
                        axisLine: {
                            show: true
                        },
                        nameGap: 15,
                        offset: 0,
                        splitLine: {
                            show: false
                        }
                    }
                ],
                series: [
                    {
                        name: 'Doanh thu',
                        type: 'line',
                        smooth: true,
                        data: sortedData.map(item => item.totalAmount),
                        itemStyle: {
                            color: '#09c10c'
                        }
                    },
                    {
                        name: 'Đơn hàng',
                        type: 'bar',
                        yAxisIndex: 1,
                        data: sortedData.map(item => item.totalOrder),
                        itemStyle: {
                            color: '#f89209',
                            opacity: 0.5,
                            borderRadius: [5, 5, 0, 0]
                        }
                    }
                ]
            }

            chart.setOption(option)

            const handleResize = () => {
                chart.resize()
            }

            window.addEventListener('resize', handleResize)

            return () => {
                chart.dispose()
                window.removeEventListener('resize', handleResize)
            }
        }
    }, [revenueData])

    return (
        <Card className='shadow-none'>
            <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                    Doanh thu
                    {/* <TimeRangeRevenueFilter onApply={handleSelectTimeRange} /> */}
                    {/* <DateSelect onChange={handleSelectTimeRange} /> */}
                </CardTitle>
            </CardHeader>
            <CardContent className='flex items-center justify-center p-2'>
                <div ref={chartRef} className='w-full h-[26rem]' />
            </CardContent>
        </Card>
    )
}

