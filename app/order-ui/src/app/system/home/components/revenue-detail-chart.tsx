import { useCallback, useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { formatCurrency, formatShortCurrency } from '@/utils'
import { RevenueTypeQuery } from '@/constants'
import { IBranchRevenue } from '@/types'

interface RevenueData {
  revenueData: IBranchRevenue[] | undefined
  revenueType: RevenueTypeQuery
}

interface TooltipParams {
  name: string
  value: number
  seriesName: string
}

export default function RevenueDetailChart({
  revenueData,
  revenueType,
}: RevenueData) {
  const { t } = useTranslation('revenue')
  const chartRef = useRef<HTMLDivElement>(null)

  const formatDate = useCallback(
    (date: string) => {
      const parsed = moment(date)

      if (!parsed.isValid()) return date

      switch (revenueType) {
        case RevenueTypeQuery.DAILY:
          return parsed.format('DD/MM')
        case RevenueTypeQuery.HOURLY:
          return parsed.format('DD/MM HH:mm')
        default:
          return parsed.format('DD/MM')
      }
    },
    [revenueType],
  )


  useEffect(() => {
    if (chartRef.current && revenueData) {
      const chart = echarts.init(chartRef.current)

      // Ensure we're working with an array and sort it
      const sortedData = Array.isArray(revenueData)
        ? [...revenueData].sort(
          (a, b) => moment(a.date).valueOf() - moment(b.date).valueOf(),
        )
        : []

      const option = {
        tooltip: {
          trigger: 'axis' as const,
          formatter: function (params: TooltipParams[]) {
            const date = params[0].name as string
            const orders = params[0].value
            const cash = formatCurrency(params[1].value)
            const bank = formatCurrency(params[2].value)
            const internal = formatCurrency(params[3].value)

            return `${date}<br/>
              ${params[0].seriesName}: ${orders} ${t('revenue.orderUnit')}<br/>
              ${params[1].seriesName}: ${cash}<br/>
              ${params[2].seriesName}: ${bank}<br/>
              ${params[3].seriesName}: ${internal}`
          },
        },
        legend: {
          data: [t('revenue.order'), t('revenue.cash'), t('revenue.bank'), t('revenue.internalWallet')],
        },
        xAxis: {
          type: 'category',
          data: sortedData.map((item) => formatDate(item.date)),
          axisLabel: {
            rotate: 45,
          },
        },
        yAxis: [
          {
            type: 'value',
            name: t('revenue.revenue'),
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
              show: true,
            },
            nameGap: 15, // Khoảng cách giữa tên trục và trục
            offset: 0, // Dịch chuyển trục
            splitLine: {
              show: true,
              lineStyle: {
                type: 'dashed',
              },
            },
          },
          {
            type: 'value',
            name: t('revenue.order'),
            position: 'right',
            // nameTextStyle: {
            //     padding: [0, 0, 0, 0], // Tăng padding bên phải
            // },
            axisLabel: {
              show: true,
              margin: 4,
            },
            axisLine: {
              show: true,
            },
            nameGap: 15,
            offset: 0,
            splitLine: {
              show: false,
            },
          },
        ],
        series: [
          {
            name: t('revenue.order'),
            type: 'line',
            smooth: true,
            yAxisIndex: 1,
            data: sortedData.map((item) => item.totalOrder),
            itemStyle: {
              color: '#f89209',
            },
          },
          {
            name: t('revenue.cash'),
            type: 'bar',
            data: sortedData.map((item) => item.totalAmountCash),
            itemStyle: {
              color: '#4169E1',
              borderRadius: [5, 5, 0, 0],
            },
          },
          {
            name: t('revenue.bank'),
            type: 'bar',
            data: sortedData.map((item) => item.totalAmountBank),
            itemStyle: {
              color: '#FF4500',
              borderRadius: [5, 5, 0, 0],
            },
          },
          {
            name: t('revenue.internalWallet'),
            type: 'bar',
            data: sortedData.map((item) => item.totalAmountInternal),
            itemStyle: {
              color: '#32CD32',
              borderRadius: [5, 5, 0, 0],
            },
          },
        ],
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
  }, [formatDate, revenueData, revenueType, t]) // Add revenueType to dependencies

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          {t('revenue.revenueSystem')}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center items-center p-2">
        <div ref={chartRef} className="h-[26rem] w-full" />
      </CardContent>
    </Card>
  )
}
