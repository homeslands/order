"use client"

import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const data = [
    { month: 'This Month', revenue: 45231.89, orders: 1234 },
    { month: 'Last Month', revenue: 37651.32, orders: 1154 }
]

export default function RevenueComparison() {
    const chartRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (chartRef.current) {
            const chart = echarts.init(chartRef.current)

            const option = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    data: ['Revenue', 'Orders']
                },
                xAxis: {
                    type: 'category',
                    data: data.map(item => item.month)
                },
                yAxis: [
                    {
                        type: 'value',
                        name: 'Revenue',
                        axisLabel: {
                            formatter: '${value}'
                        }
                    },
                    {
                        type: 'value',
                        name: 'Orders',
                        axisLabel: {
                            formatter: '{value}'
                        }
                    }
                ],
                series: [
                    {
                        name: 'Revenue',
                        type: 'bar',
                        data: data.map(item => item.revenue),
                        itemStyle: {
                            borderRadius: [5, 5, 0, 0]
                        }
                    },
                    {
                        name: 'Orders',
                        type: 'bar',
                        yAxisIndex: 1,
                        data: data.map(item => item.orders),
                        itemStyle: {
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
    }, [])

    return (
        <Card className="shadow-none">
            <CardHeader>
                <CardTitle>Revenue Comparison</CardTitle>
            </CardHeader>
            <CardContent>
                <div ref={chartRef} style={{ width: '100%', height: '300px' }} />
            </CardContent>
        </Card>
    )
}

