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
  Button,
  Badge
} from '@/components/ui'

import { useOrders, usePagination } from '@/hooks'
import { useUpdateOrderStore, useUserStore } from '@/stores'
import { APPLICABILITY_RULE, publicFileURL, ROUTE, VOUCHER_TYPE } from '@/constants'
import OrderStatusBadge from '@/components/app/badge/order-status-badge'
import { IOrder, OrderStatus } from '@/types'
import { OrderHistorySkeleton } from '@/components/app/skeleton'
import { calculateOrderItemDisplay, calculatePlacedOrderTotals, capitalizeFirstLetter, formatCurrency, showErrorToast } from '@/utils'
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
      {order?.items.length ? (
        <div className="flex flex-col gap-4">
          {order.items.map((orderItem) => {
            const orderItems = orderItem.orderItems || []
            const voucher = orderItem.voucher || null
            const displayItems = calculateOrderItemDisplay(orderItems, voucher)
            // console.log(displayItems)
            const cartTotals = calculatePlacedOrderTotals(displayItems, voucher)
            // console.log(cartTotals)
            return (
              <div key={orderItem.slug} className="flex flex-col gap-4 p-0 mt-2 bg-white rounded-lg border dark:bg-transparent">
                <div className="flex gap-4 items-center p-4 w-full border-b bg-primary/15 dark:bg-muted-foreground/10">
                  <span className="text-xs text-muted-foreground">
                    {moment(orderItem.createdAt).format('HH:mm:ss DD/MM/YYYY')}
                  </span>
                  <OrderStatusBadge order={orderItem} />
                </div>

                <div className="px-4 pb-4">
                  <div className="flex flex-col divide-y">
                    {orderItems.map((product) => (
                      <div key={product.slug} className="grid grid-cols-12 gap-2 py-4">
                        <div className="relative col-span-3 sm:col-span-2">
                          <img
                            src={`${publicFileURL}/${product.variant.product.image}`}
                            alt={product.variant.product.name}
                            className="object-cover h-16 rounded-md sm:h-28 sm:w-36"
                          />
                          <div className="flex absolute -right-2 -bottom-2 justify-center items-center w-6 h-6 text-xs text-white rounded-full sm:text-sm sm:-right-4 lg:right-4 xl:-right-4 sm:w-10 sm:h-10 bg-primary">
                            x{product.quantity}
                          </div>
                        </div>
                        <div className="flex flex-col col-span-9 justify-between sm:col-span-10">
                          <div className='flex flex-col gap-1'>
                            <span className="flex flex-col gap-1 text-sm font-semibold truncate sm:flex-row sm:text-base">
                              {product.variant.product.name} <Badge variant='outline' className='text-xs w-fit border-primary text-primary bg-primary/10'>{capitalizeFirstLetter(product.variant.size.name)}</Badge>
                            </span>
                          </div>
                          <div className='flex justify-end w-full'>
                            {(() => {
                              const displayItem = displayItems.find(di => di.slug === product.slug)
                              const original = product.variant.price || 0
                              const priceAfterPromotion = displayItem?.priceAfterPromotion || 0
                              const finalPrice = displayItem?.finalPrice || 0

                              const isSamePriceVoucher =
                                voucher?.type === VOUCHER_TYPE.SAME_PRICE_PRODUCT &&
                                voucher?.voucherProducts?.some(vp => vp.product?.slug === product.variant.product.slug)

                              // const hasPromotionDiscount = (displayItem?.promotionDiscount || 0) > 0

                              const isAtLeastOneVoucher =
                                voucher?.applicabilityRule === APPLICABILITY_RULE.AT_LEAST_ONE_REQUIRED &&
                                voucher?.voucherProducts?.some(vp => vp.product?.slug === product.variant.product.slug)

                              const hasVoucherDiscount = (displayItem?.voucherDiscount ?? 0) > 0
                              const hasPromotionDiscount = (displayItem?.promotionDiscount ?? 0) > 0
                              // finalPrice là giá cuối cùng hiển thị trên UI
                              const displayPrice = isSamePriceVoucher
                                ? finalPrice // đồng giá
                                : isAtLeastOneVoucher && hasVoucherDiscount
                                  ? original - (displayItem?.voucherDiscount || 0)
                                  : hasPromotionDiscount
                                    ? priceAfterPromotion
                                    : original

                              const shouldShowLineThrough =
                                (isSamePriceVoucher || hasPromotionDiscount || hasVoucherDiscount) &&
                                (original > displayPrice)

                              return (
                                <div className="flex gap-1 items-center">
                                  {shouldShowLineThrough && (
                                    <span className="text-xs line-through sm:text-sm text-muted-foreground/60">
                                      {formatCurrency(original)}
                                    </span>
                                  )}
                                  <span className="text-sm font-bold sm:text-md text-primary">
                                    {formatCurrency(displayPrice)}
                                  </span>
                                </div>
                              )
                            })()}
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                  <div className='flex justify-end mt-4 w-full'>
                    <div className="flex flex-col gap-2 justify-end w-[20rem]">
                      <div className="flex justify-between pb-2 w-full border-b">
                        <h3 className="text-sm font-semibold">{t('order.total')}</h3>
                        <p className="text-sm font-semibold">
                          {`${formatCurrency(cartTotals?.subTotalBeforeDiscount || 0)}`}
                        </p>
                      </div>
                      <div className="flex justify-between pb-2 w-full border-b">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          {t('order.promotionDiscount')}
                        </h3>
                        <p className="text-sm font-semibold text-muted-foreground">
                          - {`${formatCurrency(cartTotals?.promotionDiscount || 0)}`}
                        </p>
                      </div>
                      <div className="flex justify-between pb-2 w-full border-b">
                        <h3 className="text-sm italic font-medium text-green-500">
                          {t('order.voucher')}
                        </h3>
                        <p className="text-sm italic font-semibold text-green-500">
                          - {`${formatCurrency(cartTotals?.voucherDiscount || 0)}`}
                        </p>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex justify-between w-full">
                          <h3 className="font-semibold text-md">
                            {t('order.totalPayment')}
                          </h3>
                          <p className="text-lg font-extrabold text-primary">
                            {`${formatCurrency(cartTotals?.finalTotal || 0)}`}
                          </p>
                        </div>
                        {/* <span className="text-xs text-muted-foreground">
                      ({t('order.vat')})
                    </span> */}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-between items-center pt-4 bg-gray-50 dark:bg-transparent sm:flex-row">
                    <NavLink to={`${ROUTE.CLIENT_ORDER_HISTORY}?order=${orderItem.slug}`}>
                      <Button>{t('order.viewDetail')}</Button>
                    </NavLink>
                    {orderItem.status === OrderStatus.PENDING && (
                      <div className="flex gap-2 sm:mt-0">
                        <CancelOrderDialog order={orderItem} />
                        <Button
                          disabled={moment(orderItem.createdAt).isBefore(moment().subtract(15, 'minutes'))}
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
            )
          })}
        </div>
      ) : (
        <div className="text-center h-[50vh] flex justify-center items-center">
          {t('order.noOrders')}
        </div>
      )}

      {order && order?.totalPages > 0 && (
        <div className="flex items-center justify-center py-4 space-x-2">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(pagination.pageIndex - 1)}
                  className={
                    !order?.hasPrevious
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink isActive>{order?.page}</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(pagination.pageIndex + 1)}
                  className={
                    !order?.hasNext
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