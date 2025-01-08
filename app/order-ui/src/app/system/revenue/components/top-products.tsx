"use client"

import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
// import { DateSelect } from '@/components/app/select'
import { usePagination, useTopProducts } from '@/hooks'

export default function TopProducts() {
    const chartRef = useRef<HTMLDivElement>(null)
    const { pagination } = usePagination()
    const { data: revenueData } = useTopProducts({
        page: pagination.pageIndex,
        size: pagination.pageSize,
        hasPaging: true
    })

    useEffect(() => {
        if (chartRef.current && revenueData?.result?.items) {
            const chart = echarts.init(chartRef.current)
            const items = revenueData.result.items

            const option = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    data: ['Số lượng bán']
                },
                xAxis: {
                    type: 'category',
                    data: items.map(item => item.product.name),
                    axisLabel: {
                        rotate: 45
                    }
                },
                yAxis: {
                    type: 'value',
                    name: 'Số lượng'
                },
                series: [
                    {
                        name: 'Số lượng bán',
                        type: 'bar',
                        data: items.map(item => item.totalQuantity),
                        itemStyle: {
                            borderRadius: [5, 5, 0, 0],
                            color: '#f89209'
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

    // const handleSelectTimeRange = (timeRange: string) => {
    //     console.log(timeRange)
    // }

    return (
        <Card className='shadow-none'>
            <CardHeader >
                <CardTitle className='flex items-center justify-between'>Top Products
                    {/* <DateSelect onChange={handleSelectTimeRange} /> */}
                </CardTitle>
            </CardHeader>
            <CardContent className='p-0'>
                <div ref={chartRef} style={{ width: '100%', height: '300px' }} />
            </CardContent>
        </Card>
    )
}

