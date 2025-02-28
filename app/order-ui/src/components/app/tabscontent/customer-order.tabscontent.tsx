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

  if (isLoading) {
    return <OrderHistorySkeleton />
  }

  const handleUpdateOrder = (order: IOrder) => {
    if (!getUserInfo()?.slug) return showErrorToast(1042), navigate(ROUTE.LOGIN)
    setOrderItems(order)
    navigate(`${ROUTE.CLIENT_UPDATE_ORDER}/${order.slug}`)
  }

  return (
    <div className="mb-4">
      {orderData?.length ? (
        orderData.map((orderItem) => (
          <div key={orderItem.slug} className="mb-6 rounded-md border">
            {/* Header */}
            <div className="flex items-center justify-between rounded-t-md border-b px-4 py-4">
              <span className="text-xs text-muted-foreground">
                {moment(orderItem.createdAt).format('hh:mm:ss DD/MM/YYYY')}
              </span>
              <OrderStatusBadge order={orderItem} />
            </div>
            {/* Order items */}
            <NavLink
              to={`${ROUTE.CLIENT_ORDER_HISTORY}/${orderItem.slug}`}
              key={orderItem.slug}
            >
              <div className="flex flex-col">
                {orderItem.orderItems.map((product) => (
                  <div
                    key={product.slug}
                    className="grid grid-cols-12 items-center gap-2 p-4"
                  >
                    <div className="relative col-span-3">
                      <img
                        src={`${publicFileURL}/${product.variant.product.image}`}
                        alt={product.variant.product.name}
                        className="h-20 w-20 rounded-md object-cover sm:w-36"
                      />
                      <div className="absolute -bottom-2 -right-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs text-white sm:right-4 sm:h-8 sm:w-8">
                        x{product.quantity}
                      </div>
                    </div>

                    <div className="col-span-6 flex flex-col gap-1 px-1">
                      <div className="sm:text-md truncate text-sm font-semibold">
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
                <div className="flex w-full items-center justify-end">
                  {t('order.subtotal')}:&nbsp;
                  <span className="text-md font-semibold text-primary sm:text-2xl">{`${formatCurrency(orderItem.subtotal)}`}</span>
                </div>
                {orderItem.status === OrderStatus.PENDING && (
                  <div className="grid grid-cols-2 gap-2 py-4 sm:grid-cols-5">
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateOrder(orderItem)}
                    >
                      {t('order.updateOrder')}
                    </Button>
                    <CancelOrderDialog onSuccess={refetch} order={orderItem} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center">{t('order.noOrders')}</div>
      )}

      {orderData && orderData?.length > 0 && (
        <div className="flex items-center justify-center space-x-2 py-4">
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
