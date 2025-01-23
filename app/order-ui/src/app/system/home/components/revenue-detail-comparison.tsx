import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import moment from 'moment'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useBranchRevenue } from '@/hooks'
import { formatCurrency } from '@/utils'
import { RevenueTypeQuery } from '@/constants'

interface RevenueData {
    trigger?: number
    branch: string
}
export default function RevenueComparison({ trigger, branch }: RevenueData) {
    const chartRef = useRef<HTMLDivElement>(null)

    // Get current month data
    const { data: currentMonthData, refetch: refreshCurrentMonthRevenue } = useBranchRevenue({
        branch,
        startDate: moment().startOf('month').toISOString(),
        endDate: moment().endOf('month').toISOString(),
        type: RevenueTypeQuery.MONTHLY
    })

    // Get last month data
    const { data: lastMonthData, refetch: refreshLastMonthRevenue } = useBranchRevenue({
        branch,
        startDate: moment().subtract(1, 'month').startOf('month').toISOString(),
        endDate: moment().subtract(1, 'month').endOf('month').toISOString(),
        type: RevenueTypeQuery.MONTHLY
    })

    // Refetch when trigger changes
    useEffect(() => {
        if (trigger) {
            refreshCurrentMonthRevenue();
            refreshLastMonthRevenue();
        }
    }, [trigger, refreshCurrentMonthRevenue, refreshLastMonthRevenue]);

    useEffect(() => {
        if (chartRef.current && currentMonthData?.result && lastMonthData?.result) {
            const chart = echarts.init(chartRef.current)

            const currentMonth = currentMonthData.result[0] || { totalAmount: 0, totalOrder: 0 }
            const lastMonth = lastMonthData.result[0] || { totalAmount: 0, totalOrder: 0 }

            const data = [
                { month: 'Tháng này', revenue: currentMonth.totalAmount, orders: currentMonth.totalOrder },
                { month: 'Tháng trước', revenue: lastMonth.totalAmount, orders: lastMonth.totalOrder }
            ]

            const option = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    },
                },
                legend: {
                    data: ['Doanh thu', 'Đơn hàng']
                },
                xAxis: {
                    type: 'category',
                    data: data.map(item => item.month)
                },
                yAxis: [
                    {
                        type: 'value',
                        name: 'Doanh thu',
                        axisLabel: {
                            formatter: (value: number) => formatCurrency(value)
                        }
                    },
                    {
                        type: 'value',
                        name: 'Đơn hàng'
                    }
                ],
                series: [
                    {
                        name: 'Doanh thu',
                        type: 'bar',
                        data: data.map(item => item.revenue),
                        itemStyle: {
                            color: '#09c10c',
                            borderRadius: [5, 5, 0, 0]
                        }
                    },
                    {
                        name: 'Đơn hàng',
                        type: 'bar',
                        yAxisIndex: 1,
                        data: data.map(item => item.orders),
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
    }, [currentMonthData, lastMonthData])

    return (
        <Card className="shadow-none">
            <CardHeader>
                <CardTitle>So sánh doanh thu</CardTitle>
            </CardHeader>
            <CardContent>
                <div ref={chartRef} style={{ width: '100%', height: '300px' }} />
            </CardContent>
        </Card>
    )
}

