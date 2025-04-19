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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion'

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
      {order?.result.items.length ? (
        <Accordion type="multiple" className="w-full">
          {order.result.items.map((orderItem) => (
            <AccordionItem key={orderItem.slug} value={orderItem.slug}>
              <AccordionTrigger className="flex relative flex-col gap-4 items-start p-0 mt-2 bg-white rounded-lg border sm:justify-between sm:gap-0 sm:items-center">
                <div className="flex gap-4 items-center px-4 py-2 w-full border-b bg-primary/15">
                  <span className="text-xs text-muted-foreground">
                    {moment(orderItem.createdAt).format('hh:mm:ss DD/MM/YYYY')}
                  </span>
                  <OrderStatusBadge order={orderItem} />
                </div>
                <div className="grid grid-cols-1 gap-4 px-4 py-2 w-full sm:grid-cols-2 sm:flex-row">
                  <div className="grid grid-cols-1 gap-4 sm:flex-col sm:items-start">
                    <div className="flex flex-col col-span-1 gap-2">
                      <span className="text-sm font-semibold">{t('order.orderId')}: {orderItem.slug}</span>
                    </div>
                  </div>
                  <span className="flex gap-1 items-center w-full text-sm sm:justify-end text-muted-foreground">
                    {t('order.total')} ({orderItem.orderItems.length} {t('order.items')}):
                    <span className='text-lg font-semibold text-primary'>
                      {formatCurrency(orderItem.subtotal)}
                    </span>
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-0 py-4">
                <div className="flex flex-col divide-y">
                  {orderItem.orderItems.map((product) => (
                    <div key={product.slug} className="grid grid-cols-12 gap-2 py-4">
                      <div className="relative col-span-3 sm:col-span-2">
                        <img
                          src={`${publicFileURL}/${product.variant.product.image}`}
                          alt={product.variant.product.name}
                          className="object-cover h-20 rounded-md sm:w-28"
                        />
                        <div className="flex absolute -right-2 -bottom-2 justify-center items-center w-6 h-6 text-xs text-white rounded-full bg-primary">
                          x{product.quantity}
                        </div>
                      </div>
                      <div className="flex flex-col col-span-6 sm:col-span-7">
                        <span className="text-sm font-semibold truncate sm:text-base">
                          {product.variant.product.name}
                        </span>
                        <span className="text-xs text-muted-foreground sm:text-sm">
                          {t('order.productClassification')}Size {product.variant.size.name.toUpperCase()}
                        </span>
                      </div>
                      {product?.promotion && product?.promotion?.value > 0 ? (
                        <div className="flex col-span-3 gap-2 justify-end items-center text-sm font-semibold sm:col-span-3 sm:text-base">
                          <span className='text-xs line-through text-muted-foreground/60'>
                            {formatCurrency(product.variant.price)}
                          </span>
                          <span className='text-primary text-md'>
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
                <div className="flex gap-2 justify-between items-center py-4 bg-gray-50 sm:flex-row">
                  <NavLink to={`${ROUTE.CLIENT_ORDER_HISTORY}?order=${orderItem.slug}`}>
                    <Button>
                      {t('order.viewDetail')}
                    </Button>
                  </NavLink>

                  {orderItem.status === OrderStatus.PENDING && (
                    <div className="flex gap-2 mt-2 sm:mt-0">
                      <CancelOrderDialog order={orderItem} />
                      <Button className='text-orange-500 border-orange-500 hover:text-white hover:bg-orange-500' variant="outline" onClick={() => handleUpdateOrder(orderItem)}>
                        {t('order.updateOrder')}
                      </Button>
                    </div>
                  )}

                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="text-center">{t('order.noOrders')}</div>
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