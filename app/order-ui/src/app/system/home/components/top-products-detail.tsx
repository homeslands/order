import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/components/app/theme-provider'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { useBranchStore } from '@/stores'
import { IBranchTopProduct } from '@/types'

export default function TopProductsDetail({ topProducts }: { topProducts: IBranchTopProduct[] | undefined }) {
    const { t } = useTranslation('dashboard')
    const { t: tProduct } = useTranslation('product')
    const { theme } = useTheme()
    const chartRef = useRef<HTMLDivElement>(null)
    const { branch } = useBranchStore()

    useEffect(() => {
        if (chartRef.current && topProducts) {
            const chart = echarts.init(chartRef.current)
            const items = [...topProducts]
                .sort((a, b) => a.totalQuantity - b.totalQuantity) // Sort items by quantity in descending order

            const textColor = theme === 'dark' ? '#fff' : '#000' // thêm
            const axisLabelColor = theme === 'dark' ? '#ccc' : '#333' // thêm

            const option = {
                backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff', // thêm
                textStyle: { color: textColor }, // thêm
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    data: [tProduct('topProducts.quantitySold')],
                    textStyle: { color: textColor } // thêm
                },
                yAxis: {
                    type: 'category',
                    data: items.map(item => item.product.name),
                    axisLabel: {
                        interval: 0,
                        width: 100,
                        overflow: 'truncate',
                        color: axisLabelColor // thêm
                    }
                },
                xAxis: {
                    type: 'value',
                    name: tProduct('topProducts.quantity'),
                    axisLabel: { color: axisLabelColor } // thêm
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
    }, [topProducts, branch, tProduct, theme])

    return (
        <Card className='shadow-none'>
            <CardHeader >
                <CardTitle className='flex justify-between items-center'>
                    {t('dashboard.topProducts')}
                </CardTitle>
            </CardHeader>
            <CardContent className='p-0'>
                <div ref={chartRef} className='w-full h-[48rem]' />
            </CardContent>
        </Card>
    )
}
