import { useEffect } from 'react'
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
  const { userInfo } = useUserStore()
  const { addOrder } = useOrderStore()
  const { clearSelectedItems } = useOrderTrackingStore()
  const { data: orderDetail } = useOrderBySlug(orderSlug)
  const { pagination, handlePageChange, handlePageSizeChange } = usePagination()

  const handleCloseSheet = () => {
    setIsSheetOpen(false)
  }

  const { data, isLoading, refetch } = useOrders({
    hasPaging: true,
    page: pagination.pageIndex,
    size: pagination.pageSize,
    order: 'DESC',
    branchSlug: userInfo?.branch?.slug,
    status: [OrderStatus.PAID, OrderStatus.SHIPPING, OrderStatus.FAILED].join(','),
  })

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
    setSelectedRow(order.slug)
    setIsSheetOpen(true)
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
      <span className="flex items-center justify-start w-full gap-1 text-lg">
        <SquareMenu />
        {t('order.title')}
      </span>
      <div className="grid h-full grid-cols-1 gap-2">
        <DataTable
          isLoading={isLoading}
          data={data?.result.items || []}
          columns={usePendingOrdersColumns()}
          pages={data?.result?.totalPages || 1}
          onRowClick={handleOrderClick}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          rowClassName={(row) =>
            row.slug === selectedRow
              ? 'bg-primary/20 border border-primary'
              : ''
          }
        />

        <OrderItemDetailSheet
          order={orderSlug}
          isOpen={isSheetOpen}
          onClose={handleCloseSheet}
        />
      </div>
    </div>
  )
}
