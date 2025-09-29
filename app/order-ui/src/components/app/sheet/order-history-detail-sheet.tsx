import { useEffect } from 'react'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { DownloadIcon, Loader2 } from 'lucide-react'

import { useExportOrderInvoice, useOrderBySlug } from '@/hooks'
import { IOrder, OrderStatus, OrderTypeEnum } from '@/types'
import {
  Button,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { calculateOrderItemDisplay, calculatePlacedOrderTotals, capitalizeFirstLetter, formatCurrency, loadDataToPrinter, showToast } from '@/utils'
import { OrderStatusBadge, PaymentStatusBadge } from '../badge'
import { PaymentMethod, VOUCHER_TYPE } from '@/constants'

interface IOrderHistoryDetailSheetProps {
  order: IOrder | null
  isOpen: boolean
  onClose: () => void
}

export default function OrderHistoryDetailSheet({
  order,
  isOpen,
  onClose,
}: IOrderHistoryDetailSheetProps) {
  const { t: tCommon } = useTranslation(['common'])
  const { t } = useTranslation(['menu'])
  const { t: tToast } = useTranslation('toast')
  const { mutate: exportOrderInvoice, isPending } = useExportOrderInvoice()

  const { data, refetch } = useOrderBySlug(order?.slug as string)
  const orderDetail = data?.result

  const orderItems = orderDetail?.orderItems || []
  const voucher = orderDetail?.voucher || null

  const displayItems = calculateOrderItemDisplay(orderItems, voucher)

  const cartTotals = calculatePlacedOrderTotals(displayItems, voucher)

  // polling useOrderBySlug every 5 seconds
  useEffect(() => {
    if (!orderDetail) return
    const interval = setInterval(async () => {
      try {
        await refetch()
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        /* empty */
      }
    }, 3000) // Polling every 5 seconds

    return () => clearInterval(interval) // Cleanup
  }, [orderDetail, refetch])

  const handleExportOrderInvoice = async (order: IOrder | undefined) => {
    if (!order) return // Ensure order is defined before proceeding
    exportOrderInvoice(order?.slug || '', {
      onSuccess: (data: Blob) => {
        showToast(tToast('toast.exportInvoiceSuccess'))
        // Load data to print
        loadDataToPrinter(data)
      },
    })
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[100%] p-2">
        <SheetHeader>
          <SheetTitle className="flex gap-2 items-center mt-8">
            {t('order.orderDetail')}
            <span className="text-muted-foreground">
              #{order?.slug}
            </span>
          </SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto h-[80vh] pb-4 mb-4">
          {orderDetail ? (
            <div className="flex flex-col gap-4">
              {/* Info */}
              <div className="flex flex-col gap-4 w-full">
                {/* Order info */}
                <div className="flex justify-between items-center p-3 rounded-sm border">
                  <div className="flex flex-col gap-2">
                    <p className="flex gap-2 items-center pb-2">
                      <span className="font-bold">
                        {t('order.order')}{' '}
                      </span>{' '}
                      <span className="text-primary">
                        #{orderDetail?.slug}
                      </span>
                      <OrderStatusBadge order={orderDetail || undefined} />
                    </p>
                    <div className="flex gap-1 items-center text-sm font-thin">
                      <p>
                        {moment(orderDetail?.createdAt).format(
                          'hh:mm:ss DD/MM/YYYY',
                        )}
                      </p>{' '}
                      |
                      <p className="flex gap-1 items-center">
                        <span>
                          {t('order.cashier')}{' '}
                        </span>
                        <span className="text-muted-foreground">
                          {`${orderDetail?.approvalBy?.firstName} ${orderDetail?.approvalBy?.lastName} - ${orderDetail?.approvalBy?.phonenumber}`}
                        </span>
                      </p>
                    </div>
                    {orderDetail?.type === OrderTypeEnum.DELIVERY && (
                      <div className="flex gap-1 items-center">
                        <span className='text-sm font-bold'>{t('order.deliveryAddress')}: </span>
                        <span className="text-sm text-muted-foreground">{orderDetail?.deliveryTo?.formattedAddress}</span>
                      </div>
                    )}
                    {orderDetail?.type === OrderTypeEnum.DELIVERY && (
                      <div className="flex gap-1 items-center">
                        <span className='text-sm font-bold'>{t('order.deliveryPhone')}: </span>
                        <span className="text-sm text-muted-foreground">{orderDetail?.deliveryPhone}</span>
                      </div>
                    )}
                    {orderDetail?.description ? (
                      <div className="flex items-center w-full text-sm">
                        <h3 className="w-20 text-sm font-semibold">
                          {t('order.note')}
                        </h3>
                        <p className="p-2 w-full rounded-md border sm:col-span-8 border-muted-foreground/20">{orderDetail?.description}</p>
                      </div>
                    ) : (
                      <div className="flex items-center w-full text-sm">
                        <h3 className="w-20 text-sm font-semibold">
                          {t('order.note')}
                        </h3>
                        <p className="p-2 w-full rounded-md border sm:col-span-8 border-muted-foreground/20">{t('order.noNote')}</p>
                      </div>
                    )}
                  </div>
                </div>
                {/* Order owner info */}
                <div className="flex gap-2">
                  <div className="w-1/2 rounded-sm border">
                    <div className="px-3 py-2 font-bold uppercase">
                      {t('order.customer')}
                    </div>
                    <div className="px-3 py-2">
                      <p className="text-sm font-bold">
                        {`${orderDetail?.owner?.firstName} ${orderDetail?.owner?.lastName}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {orderDetail?.owner?.phonenumber}
                      </p>
                    </div>
                  </div>
                  <div className="w-1/2 rounded-sm border">
                    <div className="px-3 py-2 font-bold uppercase">
                      {t('order.orderType')}
                    </div>
                    <div className="px-3 py-2 text-sm">
                      <p className="col-span-1 text-sm font-bold">
                        <p className="col-span-1 text-sm">
                          {orderDetail?.type === OrderTypeEnum.AT_TABLE
                            ? t('order.dineIn')
                            : orderDetail?.type === OrderTypeEnum.TAKE_OUT
                              ? `${t('order.takeAway')} - ${orderDetail?.timeLeftTakeOut === 0
                                ? t('menu.immediately')
                                : `${orderDetail?.timeLeftTakeOut} ${t('menu.minutes')}`
                              }`
                              : orderDetail?.type === OrderTypeEnum.DELIVERY
                                ? `${t('order.delivery')}`
                                : t('order.takeAway')}
                        </p>
                      </p>
                      {orderDetail?.type === OrderTypeEnum.AT_TABLE && (
                        <p className="flex gap-1 text-muted-foreground">
                          <span className="col-span-2">{t('order.tableNumber')}</span>
                          <span className="col-span-1">
                            {orderDetail?.table?.name}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {/* payment */}
                <div className="flex flex-col gap-2 w-full">
                  {/* Payment method, status */}
                  <div className={`rounded-sm border ${orderDetail?.payment && orderDetail?.payment?.statusMessage === OrderStatus.COMPLETED ? 'border-green-500 bg-green-500/10' : 'border-destructive bg-destructive/10'}`}>
                    <div className="px-3 py-2">
                      <p className="flex flex-col gap-1 items-start pb-2">
                        <span className="col-span-1 text-sm font-bold">
                          {t('paymentMethod.title')}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {orderDetail?.payment?.paymentMethod ? (
                            <>
                              {orderDetail?.payment.paymentMethod ===
                                PaymentMethod.BANK_TRANSFER && (
                                  <span>{t('paymentMethod.bankTransfer')}</span>
                                )}
                              {orderDetail?.payment.paymentMethod ===
                                PaymentMethod.CASH && <span>{t('paymentMethod.cash')}</span>}
                              {orderDetail?.payment.paymentMethod ===
                                PaymentMethod.CREDIT_CARD && <span>{t('paymentMethod.creditCard')}</span>}
                              {orderDetail?.payment.paymentMethod ===
                                PaymentMethod.POINT && <span>{t('paymentMethod.point')}</span>}
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {t('order.pending')}
                            </span>
                          )}
                        </span>
                      </p>
                      <p className="flex gap-1 items-center">
                        <span className="col-span-1 text-sm font-semibold">
                          {t('paymentMethod.status')}
                        </span>
                        <span className="col-span-1 text-sm">
                          {order?.payment ? (
                            <PaymentStatusBadge
                              status={orderDetail?.payment?.statusCode}
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {t('order.pending')}
                            </span>
                          )}
                        </span>
                      </p>
                    </div>
                  </div>
                  {/* Total */}

                </div>
                {/* Order table */}
                <div className="overflow-x-auto">
                  {/* Desktop Table */}
                  <Table className="hidden min-w-full border border-collapse table-fixed sm:table">
                    <TableCaption>{t('order.orderListCaption')}</TableCaption>

                    <TableHeader className="bg-muted-foreground/10 dark:bg-transparent">
                      <TableRow>
                        <TableHead className="w-1/4">{t('order.product')}</TableHead>
                        <TableHead className="w-[120px] text-center">{t('order.size')}</TableHead>
                        <TableHead className="w-[120px] text-center">{t('order.quantity')}</TableHead>
                        <TableHead className="w-1/4">{t('order.note')}</TableHead>
                        <TableHead className="w-[120px] text-right">{t('order.unitPrice')}</TableHead>
                        <TableHead className="w-[120px] text-right">{t('order.grandTotal')}</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {orderDetail?.orderItems?.map((item) => {
                        const displayItem = displayItems.find(di => di.slug === item.slug)
                        const original = item.variant?.price || 0
                        const priceAfterPromotion = displayItem?.priceAfterPromotion || 0
                        const finalPrice = displayItem?.finalPrice || 0

                        const isSamePriceVoucher =
                          voucher?.type === VOUCHER_TYPE.SAME_PRICE_PRODUCT &&
                          voucher?.voucherProducts?.some(vp => vp.product?.slug === item.variant?.product.slug)

                        const hasPromotionDiscount = (displayItem?.promotionDiscount || 0) > 0

                        const displayPrice = isSamePriceVoucher
                          ? finalPrice
                          : hasPromotionDiscount
                            ? priceAfterPromotion
                            : original

                        const shouldShowLineThrough = isSamePriceVoucher || hasPromotionDiscount

                        return (
                          <TableRow key={item.slug}>
                            <TableCell className="font-semibold truncate">
                              <span className="truncate max-w-[150px]">{item.variant?.product.name}</span>
                            </TableCell>

                            <TableCell className="text-center">
                              {capitalizeFirstLetter(item.variant?.size?.name || '')}
                            </TableCell>

                            <TableCell className="text-center">{item.quantity}</TableCell>

                            <TableCell className="text-sm text-muted-foreground break-words max-w-[180px]">
                              {item.note || t("order.noNote")}
                            </TableCell>

                            <TableCell className="text-right">
                              <div className="flex flex-col items-end gap-0.5">
                                {shouldShowLineThrough && original !== finalPrice && (
                                  <span className="text-sm line-through text-muted-foreground">
                                    {formatCurrency(original)}
                                  </span>
                                )}
                                <span className="text-sm font-bold text-primary">
                                  {formatCurrency(displayPrice)}
                                </span>
                              </div>
                            </TableCell>

                            <TableCell className="font-extrabold text-right whitespace-nowrap text-primary">
                              {formatCurrency(item.subtotal)}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>

                  {/* Mobile Card Layout */}
                  <div className="flex flex-col gap-3 sm:hidden">
                    <h3 className="text-sm font-medium text-center text-muted-foreground">
                      {t('order.orderListCaption')}
                    </h3>
                    {orderDetail?.orderItems?.map((item) => {
                      const displayItem = displayItems.find(di => di.slug === item.slug)
                      const original = item.variant?.price || 0
                      const priceAfterPromotion = displayItem?.priceAfterPromotion || 0
                      const finalPrice = displayItem?.finalPrice || 0

                      const isSamePriceVoucher =
                        voucher?.type === VOUCHER_TYPE.SAME_PRICE_PRODUCT &&
                        voucher?.voucherProducts?.some(vp => vp.product?.slug === item.variant?.product.slug)

                      const hasPromotionDiscount = (displayItem?.promotionDiscount || 0) > 0

                      const displayPrice = isSamePriceVoucher
                        ? finalPrice
                        : hasPromotionDiscount
                          ? priceAfterPromotion
                          : original

                      const shouldShowLineThrough = isSamePriceVoucher || hasPromotionDiscount

                      return (
                        <div key={item.slug} className="p-3 bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                          {/* Product Name */}
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="flex-1 pr-2 text-sm font-semibold">{item.variant?.product.name}</h4>
                            <span className="px-2 py-1 text-xs bg-gray-100 rounded dark:bg-gray-700">
                              {capitalizeFirstLetter(item.variant?.size?.name || '')}
                            </span>
                          </div>

                          {/* Quantity and Price Row */}
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex gap-1 items-center">
                              <span className="text-xs text-muted-foreground">{t('order.quantity')}:</span>
                              <span className="text-sm font-medium">{item.quantity}</span>
                            </div>
                            <div className="flex items-end gap-0.5">
                              {shouldShowLineThrough && original !== finalPrice && (
                                <span className="text-xs line-through text-muted-foreground">
                                  {formatCurrency(original)}
                                </span>
                              )}
                              <span className="text-sm font-bold text-primary">
                                {formatCurrency(displayPrice)}
                              </span>
                            </div>
                          </div>

                          {/* Note */}
                          {item.note && (
                            <div className="mb-2">
                              <span className="text-xs text-muted-foreground">{t('order.note')}: </span>
                              <span className="text-xs text-muted-foreground">{item.note}</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="flex flex-col gap-2 p-2 rounded-sm border">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      {t('order.subtotal')}
                    </p>
                    <p className='text-muted-foreground'>{`${formatCurrency(cartTotals?.subTotalBeforeDiscount || 0)}`}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm italic text-green-500">
                      {t('order.promotionDiscount')}
                    </p>
                    <p className='text-sm italic text-green-500'>{`- ${formatCurrency(cartTotals?.promotionDiscount || 0)}`}</p>
                  </div>
                  {orderDetail?.voucher &&
                    <div className="flex justify-between pb-4 w-full border-b">
                      <h3 className="text-sm italic font-medium text-green-500">
                        {t('order.voucher')} ({voucher?.title})
                      </h3>
                      <p className="text-sm italic font-semibold text-green-500">
                        - {`${formatCurrency(cartTotals?.voucherDiscount || 0)}`}
                      </p>
                    </div>}
                  {orderDetail && orderDetail?.accumulatedPointsToUse > 0 &&
                    <div className="flex justify-between pb-4 w-full">
                      <h3 className="text-sm italic font-medium text-primary">
                        {t('order.loyaltyPoint')}
                      </h3>
                      <p className="text-sm italic font-semibold text-primary">
                        - {`${formatCurrency(orderDetail?.accumulatedPointsToUse || 0)}`}
                      </p>
                    </div>}
                  {orderDetail?.type === OrderTypeEnum.DELIVERY && (
                    <div className="flex justify-between pb-4 w-full">
                      <h3 className="text-sm italic font-medium text-muted-foreground/60">
                        {t('order.deliveryFee')}
                      </h3>
                      <p className="text-sm italic font-semibold text-muted-foreground/60">
                        {`${formatCurrency(orderDetail?.deliveryFee || 0)}`}
                      </p>
                    </div>
                  )}
                  {orderDetail?.loss > 0 &&
                    <div className="flex justify-between pb-4 w-full">
                      <h3 className="text-sm italic font-medium text-green-500">
                        {t('order.invoiceAutoDiscountUnderThreshold')}
                      </h3>
                      <p className="text-sm italic font-semibold text-green-500">
                        - {`${formatCurrency(orderDetail?.loss || 0)}`}
                      </p>
                    </div>}
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-md">
                      {t('order.totalPayment')}
                    </p>
                    <p className="text-xl font-bold text-primary">{`${formatCurrency(orderDetail?.subtotal || 0)}`}</p>
                  </div>
                  {/* <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground/80">({t('order.vat')})</p>
                  </div> */}
                </div>
              </div>
            </div>
          ) : (
            <p className="flex min-h-[12rem] items-center justify-center text-muted-foreground">
              {tCommon('common.noData')}
            </p>
          )}
        </div>
        <SheetFooter>
          <div className="w-full">
            <Button className='w-full' onClick={() => handleExportOrderInvoice(orderDetail)} disabled={isPending}>
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <DownloadIcon />}
              {t('order.exportInvoice')}
            </Button>
            {/* <ShowInvoiceDialog order={order} /> */}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
