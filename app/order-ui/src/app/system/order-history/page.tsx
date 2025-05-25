import { useEffect, useState, useRef } from 'react'
import moment from 'moment'
import { Helmet } from 'react-helmet'
import { SquareMenu } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { DataTable } from '@/components/ui'
import { useOrders, usePagination } from '@/hooks'
import { useUserStore } from '@/stores'
import { useOrderHistoryColumns } from './DataTable/columns'
import { IOrder, OrderStatus } from '@/types'
import OrderFilter from './DataTable/actions/order-filter'
import { OrderHistoryDetailSheet } from '@/components/app/sheet'
import { showToast } from '@/utils'
import { notificationSound } from '@/assets/sound'

export default function OrderHistoryPage() {
  const { t } = useTranslation(['menu'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const { t: tHelmet } = useTranslation('helmet')
  const { userInfo } = useUserStore()
  const { pagination, handlePageChange, handlePageSizeChange, setPagination } = usePagination()
  const [status, setStatus] = useState<OrderStatus | 'all'>('all')
  const [isSelected, setIsSelected] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null)
  const [startDate, setStartDate] = useState<string>(moment().format('YYYY-MM-DD'))
  const [endDate, setEndDate] = useState<string>(moment().format('YYYY-MM-DD'))
  const [previousOrderCount, setPreviousOrderCount] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const { data, isLoading, refetch } = useOrders({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    order: 'DESC',
    branch: userInfo?.branch?.slug || '',
    hasPaging: true,
    startDate: startDate,
    endDate: endDate,
    status: status !== 'all' ? status : [OrderStatus.PENDING, OrderStatus.SHIPPING, OrderStatus.PAID, OrderStatus.FAILED, OrderStatus.COMPLETED].join(','),
  })

  // Check for new orders and play sound
  useEffect(() => {
    const currentOrderCount = data?.result?.items?.length || 0
    if (currentOrderCount > previousOrderCount && previousOrderCount > 0) {
      // Play notification sound
      if (audioRef.current) {
        audioRef.current.currentTime = 0 // Reset the audio to start
        audioRef.current.play()
      }
    }
    setPreviousOrderCount(currentOrderCount)
  }, [data?.result?.items, previousOrderCount])

  // Reset page when filters change
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      pageIndex: 1
    }))
  }, [startDate, endDate, status, setPagination])

  // handle refresh and show toast when success
  const handleRefresh = () => {
    refetch()
    showToast(tToast('toast.refreshSuccess'))
  }

  // polling useOrders every 5 seconds, but only when dialog is not open
  useEffect(() => {
    if (isSelected) return // Skip polling when dialog is open

    const interval = setInterval(() => {
      refetch()
    }, 5000)
    return () => clearInterval(interval)
  }, [refetch, isSelected])

  const filterConfig = [
    {
      id: 'status',
      label: t('order.status'),
      options: [
        { label: tCommon('dataTable.all'), value: 'all' },
        { label: t('order.pending'), value: OrderStatus.PENDING },
        { label: t('order.shipping'), value: OrderStatus.SHIPPING },
        { label: t('order.paid'), value: OrderStatus.PAID },
        { label: t('order.failed'), value: OrderStatus.FAILED },
        { label: t('order.completed'), value: OrderStatus.COMPLETED },
      ],
    },
    // {
    //   id: 'paymentStatus',
    //   label: t('order.paymentStatus'),
    //   options: [
    //     { label: t('order.paid'), value: true },
    //     { label: t('order.unpaid'), value: false },
    //   ],
    // },
  ]

  const handleFilterChange = (filterId: string, value: string) => {
    if (filterId === 'status') {
      setStatus(value as OrderStatus | 'all')
    }
  }

  const handleOrderClick = (order: IOrder) => {
    setIsSelected(true)
    setSelectedOrder(order)
  }

  return (
    <div className="flex flex-col">
      <audio ref={audioRef} src={notificationSound} preload="auto" />
      <Helmet>
        <meta charSet='utf-8' />
        <title>
          {tHelmet('helmet.orderHistory.title')}
        </title>
        <meta name='description' content={tHelmet('helmet.orderHistory.title')} />
      </Helmet>
      <span className="flex gap-1 justify-start items-center w-full text-lg">
        <SquareMenu />
        {t('order.title')}
      </span>
      <div className="grid grid-cols-1 h-full">
        <DataTable
          columns={useOrderHistoryColumns()}
          data={data?.result?.items || []}
          isLoading={isLoading}
          pages={data?.result?.totalPages || 0}
          hiddenDatePicker={false}
          onRowClick={handleOrderClick}
          filterOptions={OrderFilter}
          filterConfig={filterConfig}
          onDateChange={(start, end) => {
            setStartDate(start)
            setEndDate(end)
          }}
          onFilterChange={handleFilterChange}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onRefresh={handleRefresh}
          rowClassName={(row) =>
            row.slug === selectedOrder?.slug
              ? 'bg-primary/20 border border-primary'
              : ''
          }
        />
        <OrderHistoryDetailSheet
          order={selectedOrder}
          isOpen={isSelected}
          onClose={() => setIsSelected(false)}
        />
      </div>
    </div>
  )
}
