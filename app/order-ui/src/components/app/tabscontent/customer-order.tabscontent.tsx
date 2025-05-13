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
  Button
} from '@/components/ui'

import { useOrders, usePagination } from '@/hooks'
import { useUpdateOrderStore, useUserStore } from '@/stores'
import { publicFileURL, ROUTE } from '@/constants'
import OrderStatusBadge from '@/components/app/badge/order-status-badge'
import { IOrder, OrderStatus } from '@/types'
import { OrderHistorySkeleton } from '@/components/app/skeleton'
import { formatCurrency, showErrorToast } from '@/utils'
import { CancelOrderDialog } from '@/components/app/dialog'

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
  const {
    data: order,
    isLoading,
  } = useOrders({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    owner: userInfo?.slug,
    order: 'DESC',
    hasPaging: true,
    status: status === OrderStatus.ALL ? undefined : status,
  })

  const handleUpdateOrder = (order: IOrder) => {
    if (!getUserInfo()?.slug) return showErrorToast(1042), navigate(ROUTE.LOGIN)
    setOrderItems(order)
    navigate(`${ROUTE.CLIENT_UPDATE_ORDER}/${order.slug}`)
  }

  if (isLoading) {
    return <OrderHistorySkeleton />
  }

  return (
    <div>
      {order?.result.items.length ? (
        <div className="flex flex-col gap-4">
          {order.result.items.map((orderItem) => (
            <div key={orderItem.slug} className="flex flex-col gap-4 p-0 mt-2 bg-white rounded-lg border">
              <div className="flex gap-4 items-center p-4 w-full border-b bg-primary/15">
                <span className="text-xs text-muted-foreground">
                  {moment(orderItem.createdAt).format('HH:mm:ss DD/MM/YYYY')}
                </span>
                <OrderStatusBadge order={orderItem} />
              </div>

              <div className="px-4 pb-4">
                <div className="flex flex-col divide-y">
                  {orderItem.orderItems.map((product) => (
                    <div key={product.slug} className="grid grid-cols-12 gap-2 py-4">
                      <div className="relative col-span-3 sm:col-span-2">
                        <img
                          src={`${publicFileURL}/${product.variant.product.image}`}
                          alt={product.variant.product.name}
                          className="object-cover h-16 rounded-md sm:h-28 sm:w-36"
                        />
                        <div className="flex absolute -right-2 -bottom-2 justify-center items-center w-6 h-6 text-xs text-white rounded-full sm:-right-4 lg:right-4 xl:-right-3 lg:w-8 lg:h-8 bg-primary">
                          x{product.quantity}
                        </div>
                      </div>
                      <div className="flex flex-col col-span-6 sm:col-span-7">
                        <span className="text-sm font-semibold truncate sm:text-base">
                          {product.variant.product.name}
                        </span>
                        <span className="hidden text-xs sm:block text-muted-foreground sm:text-sm">
                          {t('order.productClassification')}Size {product.variant.size.name.toUpperCase()}
                        </span>
                        <span className="block text-xs sm:hidden text-muted-foreground sm:text-sm">
                          Size {product.variant.size.name.toUpperCase()}
                        </span>
                      </div>
                      {product?.promotion && product?.promotion?.value > 0 ? (
                        <div className="flex col-span-3 gap-2 justify-end items-center text-sm font-semibold sm:col-span-3 sm:text-base">
                          <span className="text-xs line-through sm:text-sm text-muted-foreground/60">
                            {formatCurrency(product.variant.price)}
                          </span>
                          <span className="text-primary text-md">
                            {formatCurrency(product.variant.price * (1 - product.promotion.value / 100))}
                          </span>
                        </div>
                      ) : (
                        <div className="flex col-span-3 justify-end items-center text-sm font-semibold sm:col-span-3 sm:text-base">
                          {formatCurrency(product.variant.price * product.quantity)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 justify-between items-center pt-4 bg-gray-50 sm:flex-row">
                  <NavLink to={`${ROUTE.CLIENT_ORDER_HISTORY}?order=${orderItem.slug}`}>
                    <Button disabled={moment(orderItem.createdAt).isBefore(moment().subtract(10, 'minutes'))}>{t('order.viewDetail')}</Button>
                  </NavLink>
                  {orderItem.status === OrderStatus.PENDING && (
                    <div className="flex gap-2 sm:mt-0">
                      <CancelOrderDialog order={orderItem} />
                      <Button
                        disabled={moment(orderItem.createdAt).isBefore(moment().subtract(10, 'minutes'))}
                        className='text-orange-500 border-orange-500 hover:text-white hover:bg-orange-500'
                        variant="outline"
                        onClick={() => handleUpdateOrder(orderItem)}
                      >
                        {t('order.updateOrder')}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center h-[50vh] flex justify-center items-center">
          {t('order.noOrders')}
        </div>
      )}

      {order && order?.result.totalPages > 0 && (
        <div className="flex justify-center items-center py-4 space-x-2">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(pagination.pageIndex - 1)}
                  className={
                    !order?.result.hasPrevious
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
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