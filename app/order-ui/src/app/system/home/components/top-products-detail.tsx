import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { usePagination, useTopBranchProducts } from '@/hooks'
import { useBranchStore } from '@/stores'

export default function TopProductsDetail() {
    const { t } = useTranslation('dashboard')
    const { t: tProduct } = useTranslation('product')
    const chartRef = useRef<HTMLDivElement>(null)
    const { pagination } = usePagination()
    const { branch } = useBranchStore()
    const { data: topBranchProducts } = useTopBranchProducts({
        branch: branch?.slug || '',
        page: pagination.pageIndex,
        size: pagination.pageSize,
        hasPaging: true
    })

    useEffect(() => {
        if (chartRef.current && topBranchProducts?.result?.items) {
            const chart = echarts.init(chartRef.current)
            const items = [...topBranchProducts.result.items]
                .sort((a, b) => a.totalQuantity - b.totalQuantity) // Sort items by quantity in descending order

            const option = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    data: [tProduct('topProducts.quantitySold')]
                },
                yAxis: {
                    type: 'category',
                    data: items.map(item => item.product.name),
                    axisLabel: {
                        interval: 0,
                        width: 100,
                        overflow: 'truncate'
                    }
                },
                xAxis: {
                    type: 'value',
                    name: tProduct('topProducts.quantity')
                },
                series: [
                    {
                        name: tProduct('topProducts.quantitySold'),
                        type: 'bar',
                        data: items.map(item => item.totalQuantity),
                        itemStyle: {
                            borderRadius: [0, 5, 5, 0],
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
    }, [topBranchProducts, branch, tProduct])

    return (
        <Card className='shadow-none'>
            <CardHeader >
                <CardTitle className='flex justify-between items-center'>
                    {t('dashboard.topProducts')}
                </CardTitle>
            </CardHeader>
            <CardContent className='p-0'>
                <div ref={chartRef} className='w-full h-[26rem]' />
            </CardContent>
        </Card>
    )
}

