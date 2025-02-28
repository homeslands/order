import { NavLink, useNavigate } from 'react-router-dom'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui'

import { Button } from '@/components/ui'
import { useOrders, usePagination } from '@/hooks'
import { useUpdateOrderStore, useUserStore } from '@/stores'
import { publicFileURL, ROUTE } from '@/constants'
import OrderStatusBadge from '@/components/app/badge/order-status-badge'
import { IOrder, OrderStatus } from '@/types'
import { OrderHistorySkeleton } from '@/components/app/skeleton'
import { formatCurrency, showErrorToast } from '@/utils'
import { CancelOrderDialog } from '@/components/app/dialog'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function CustomerOrderTabsContent({
  status,
}: {
  status: OrderStatus
}) {
  const { t } = useTranslation(['menu'])
  const navigate = useNavigate()
  const { userInfo, getUserInfo } = useUserStore()
  const { pagination, handlePageChange } = usePagination()
  const { setOrderItems } = useUpdateOrderStore()
  const [orders, setOrders] = useState<IOrder[] | []>([])
  const {
    data: order,
    isLoading,
    refetch,
  } = useOrders({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    owner: userInfo?.slug,
    order: 'DESC',
    hasPaging: true,
    status: status === OrderStatus.ALL ? undefined : status,
  })

  const orderData = order?.result.items
  useEffect(() => {
    if (orderData) {
      orderData.forEach((item) => { item.isExtend = false })
      setOrders(orderData)
    }
  }, [orderData])

  if (isLoading) {
    return <OrderHistorySkeleton />
  }
  const handleUpdateOrder = (order: IOrder) => {
    if (!getUserInfo()?.slug) return showErrorToast(1042), navigate(ROUTE.LOGIN)
    setOrderItems(order)
    navigate(`${ROUTE.CLIENT_UPDATE_ORDER}/${order.slug}`)
  }
  const handleExtend = (orderItem: IOrder) => {
    const newOrders = orders.map((item) => {
      if (item.slug === orderItem.slug) {
        item.isExtend = !item.isExtend
      }
      return item
    })
    setOrders(newOrders)
  }
  return (
    <div className="mb-4">
      {orders?.length ? (
        orders.map((orderItem) => (
          <div key={orderItem.slug} className="mb-6 border rounded-md">
            {/* Header */}
            <div className="flex items-center gap-1 px-4 py-4 border-b rounded-t-md w-full">
              <div className={`flex flex-col ${orderItem.isExtend ? 'w-1/2' : 'w-1/3'}`} >
                <span className='md:text-[14px] text-[12px]' >{t('order.orderId')} : {orderItem.slug}</span>
                <span className="text-xs text-muted-foreground">
                  {moment(orderItem.createdAt).format('hh:mm:ss DD/MM/YYYY')}
                </span>
              </div>
              <div className={`flex items-center gap-4 transition-all duration-500 ${orderItem.isExtend ? 'w-1/2 justify-end' : 'w-1/3 justify-center'}`}>
                <OrderStatusBadge order={orderItem} />
                {orderItem.isExtend && <ChevronUp onClick={() => handleExtend(orderItem)} />}
              </div>
              <div className={`flex items-center justify-end gap-2 transition-all duration-500 ${orderItem.isExtend && 'hidden'} w-1/3`}>
                <div className='md:text-[14px] text-[12px] flex flex-col md:flex-row'>
                  <span className='text-start'>{t('order.total')} ({orderItem.orderItems.length} {t('order.items')}):</span>
                  <span className='ms-2 text-orange-500 font-bold'>{`${formatCurrency(orderItem.subtotal)}`}</span>
                </div>
                <ChevronDown onClick={() => handleExtend(orderItem)} />
              </div>
            </div>

            {/* Content */}
            <div className={`transition-[max-height] duration-500 overflow-hidden ${orderItem.isExtend ? 'max-h-[1000px]' : 'max-h-0'}`}>
              <NavLink
                to={`${ROUTE.CLIENT_ORDER_HISTORY}/${orderItem.slug}`}
                key={orderItem.slug}
              >
                <div className="flex flex-col">
                  {orderItem.orderItems.map((product) => (
                    <div
                      key={product.slug}
                      className="grid items-center grid-cols-12 gap-2 p-4"
                    >
                      <div className="relative col-span-3">
                        <img
                          src={`${publicFileURL}/${product.variant.product.image}`}
                          alt={product.variant.product.name}
                          className="object-cover w-20 h-20 rounded-md sm:w-36"
                        />
                        <div className="absolute flex items-center justify-center text-xs text-white rounded-full -bottom-2 -right-3 w-7 h-7 bg-primary sm:right-4 sm:h-8 sm:w-8">
                          x{product.quantity}
                        </div>
                      </div>

                      <div className="flex flex-col col-span-6 gap-1 px-1">
                        <div className="text-sm font-semibold truncate sm:text-md">
                          {product.variant.product.name}
                        </div>
                        <div className="text-xs text-muted-foreground sm:text-sm">
                          {product.variant.size.name.toLocaleUpperCase()} -{' '}
                          {`${formatCurrency(product.variant.price)}`}
                        </div>
                      </div>
                      <div className="col-span-3">
                        <span>
                          {`${formatCurrency(product.variant.price * product.quantity)}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </NavLink>
              <div className="flex flex-col justify-end gap-2 px-4">
                <div className="flex flex-col">
                  <div className="flex items-end justify-end w-full gap-2">
                    {t('order.subtotal')}:&nbsp;
                    <span className="font-bold text-primary sm:text-2xl">{`${formatCurrency(orderItem.subtotal)}`}</span>
                  </div>
                  {orderItem.status === OrderStatus.PENDING && (
                    <div className="flex gap-2 py-2 justify-start">
                      <Button
                        className='w-fit'
                        variant="outline"
                        onClick={() => handleUpdateOrder(orderItem)}
                      >
                        {t('order.updateOrder')}
                      </Button>
                      <div className='w-fit'>
                        <CancelOrderDialog onSuccess={refetch} order={orderItem} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center">{t('order.noOrders')}</div>
      )}

      {order && orders?.length > 0 && (
        <div className="flex items-center justify-center py-4 space-x-2">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(pagination.pageIndex - 1)}
                  className={
                    !order?.result.hasPrevios
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>

              {/* Current page */}
              <PaginationItem>
                <PaginationLink isActive>{order?.result.page}</PaginationLink>
              </PaginationItem>

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(pagination.pageIndex + 1)}
                  className={
                    !order?.result.hasNext
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
