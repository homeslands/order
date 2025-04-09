import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { SquareMenu } from 'lucide-react'

import { DataTable } from '@/components/ui'
import { useOrderBySlug, useOrders, usePagination } from '@/hooks'
import {
  useOrderStore,
  useOrderTrackingStore,
  useSelectedOrderStore,
  useUserStore,
} from '@/stores'
import { IOrder, OrderStatus } from '@/types'
import { usePendingOrdersColumns } from './DataTable/columns'
import { OrderItemDetailSheet } from '@/components/app/sheet'
import { OrderFilter } from './DataTable/filters'
import moment from 'moment'

export default function OrderManagementPage() {
  const { t } = useTranslation(['menu'])
  const { t: tHelmet } = useTranslation('helmet')
  const {
    setOrderSlug,
    setIsSheetOpen,
    setSelectedRow,
    isSheetOpen,
    orderSlug,
    selectedRow,
  } = useSelectedOrderStore()
  const { t: tCommon } = useTranslation('common')
  const { userInfo } = useUserStore()
  const { addOrder } = useOrderStore()
  const { clearSelectedItems } = useOrderTrackingStore()
  const { data: orderDetail } = useOrderBySlug(orderSlug)
  const { pagination, handlePageChange, handlePageSizeChange, setPagination } = usePagination()
  const [status, setStatus] = useState<OrderStatus | 'all'>('all')
  const [searchParams, setSearchParams] = useSearchParams()
  const [slug, setSlug] = useState(searchParams.get('slug') || selectedRow)
  const [startDate, setStartDate] = useState<string>(moment().format('YYYY-MM-DD'))
  const [endDate, setEndDate] = useState<string>(moment().format('YYYY-MM-DD'))

  useEffect(() => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      newParams.set('slug', slug)
      return newParams
    })

    // setIsSheetOpen(slug !== '')
    if (slug !== '') {
      setOrderSlug(slug)
    }
  }, [setSearchParams, slug, setIsSheetOpen, setOrderSlug, selectedRow])

  const { data, isLoading, refetch } = useOrders({
    hasPaging: true,
    page: pagination.pageIndex,
    size: pagination.pageSize,
    order: 'DESC',
    branchSlug: userInfo?.branch?.slug,
    startDate: startDate,
    endDate: endDate,
    status: status !== 'all' ? status : [OrderStatus.PAID, OrderStatus.SHIPPING, OrderStatus.FAILED].join(','),
  })

  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      pageIndex: 1
    }))
  }, [startDate, endDate, status, setPagination])
  useEffect(() => {
    if (orderDetail?.result) {
      addOrder(orderDetail.result)
    }
  }, [orderDetail, addOrder])

  //polling useOrders every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 5000)
    return () => clearInterval(interval)
  }, [refetch])

  const handleOrderClick = (order: IOrder) => {
    clearSelectedItems()
    setOrderSlug(order.slug)
    setSlug(order.slug)
    setSelectedRow(order.slug)
    setIsSheetOpen(true)
  }

  const filterConfig = [
    {
      id: 'status',
      label: t('order.status'),
      options: [
        { label: tCommon('dataTable.all'), value: 'all' },
        { label: t('order.pending'), value: OrderStatus.PENDING },
        { label: t('order.paid'), value: OrderStatus.PAID },
        { label: t('order.shipping'), value: OrderStatus.SHIPPING },
        { label: t('order.failed'), value: OrderStatus.FAILED },
      ],
    },
  ]

  const handleFilterChange = (filterId: string, value: string) => {
    if (filterId === 'status') {
      setStatus(value as OrderStatus | 'all')
    }
  }

  return (
    <div className="flex flex-col flex-1 gap-2">
      <Helmet>
        <meta charSet='utf-8' />
        <title>
          {tHelmet('helmet.orderManagement.title')}
        </title>
        <meta name='description' content={tHelmet('helmet.orderManagement.title')} />
      </Helmet>
      <span className="flex gap-1 justify-start items-center w-full text-lg">
        <SquareMenu />
        {t('order.title')}
      </span>
      <div className="grid grid-cols-1 gap-2 h-full">
        <DataTable
          isLoading={isLoading}
          data={data?.result.items || []}
          columns={usePendingOrdersColumns()}
          pages={data?.result?.totalPages || 1}
          hiddenDatePicker={false}
          onRowClick={handleOrderClick}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onDateChange={(start, end) => {
            setStartDate(start)
            setEndDate(end)
          }}
          filterConfig={filterConfig}
          filterOptions={OrderFilter}
          onFilterChange={handleFilterChange}
          rowClassName={(row) =>
            row.slug === selectedRow
              ? 'bg-primary/20 border border-primary'
              : ''
          }
        />

        <OrderItemDetailSheet
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
        />
      </div>
    </div>
  )
}
