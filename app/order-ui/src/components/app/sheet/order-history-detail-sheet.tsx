import { useEffect } from 'react'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

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
import { VOUCHER_TYPE } from '@/constants'
import { DownloadIcon, Loader2 } from 'lucide-react'

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
          <SheetTitle className="flex items-center gap-2 mt-8">
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
              <div className="flex flex-col w-full gap-4">
                {/* Order info */}
                <div className="flex items-center justify-between p-3 border rounded-sm">
                  <div className="flex flex-col gap-2">
                    <p className="flex items-center gap-2 pb-2">
                      <span className="font-bold">
                        {t('order.order')}{' '}
                      </span>{' '}
                      <span className="text-primary">
                        #{orderDetail?.slug}
                      </span>
                      <OrderStatusBadge order={orderDetail || undefined} />
                    </p>
                    <div className="flex items-center gap-1 text-sm font-thin">
                      <p>
                        {moment(orderDetail?.createdAt).format(
                          'hh:mm:ss DD/MM/YYYY',
                        )}
                      </p>{' '}
                      |
                      <p className="flex items-center gap-1">
                        <span>
                          {t('order.cashier')}{' '}
                        </span>
                        <span className="text-muted-foreground">
                          {`${orderDetail?.approvalBy?.firstName} ${orderDetail?.approvalBy?.lastName} - ${orderDetail?.approvalBy?.phonenumber}`}
                        </span>
                      </p>
                    </div>
                    {orderDetail?.description ? (
                      <div className="flex items-center w-full text-sm">
                        <h3 className="w-20 text-sm font-semibold">
                          {t('order.note')}
                        </h3>
                        <p className="w-full p-2 border rounded-md sm:col-span-8 border-muted-foreground/20">{orderDetail?.description}</p>
                      </div>
                    ) : (
                      <div className="flex items-center w-full text-sm">
                        <h3 className="w-20 text-sm font-semibold">
                          {t('order.note')}
                        </h3>
                        <p className="w-full p-2 border rounded-md sm:col-span-8 border-muted-foreground/20">{t('order.noNote')}</p>
                      </div>
                    )}
                  </div>
                </div>
                {/* Order owner info */}
                <div className="flex gap-2">
                  <div className="w-1/2 border rounded-sm">
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
                  <div className="w-1/2 border rounded-sm">
                    <div className="px-3 py-2 font-bold uppercase">
                      {t('order.orderType')}
                    </div>
                    <div className="px-3 py-2 text-sm">
                      <p className="font-bold">
                        {orderDetail?.type === OrderTypeEnum.AT_TABLE
                          ? t('order.dineIn')
                          : t('order.takeAway')}
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
                <div className="flex flex-col w-full gap-2">
                  {/* Payment method, status */}
                  <div className={`rounded-sm border ${orderDetail?.payment && orderDetail?.payment?.statusMessage === OrderStatus.COMPLETED ? 'border-green-500 bg-green-100' : 'border-destructive bg-destructive/10'}`}>
                    <div className="px-3 py-2">
                      <p className="flex flex-col items-start gap-1 pb-2">
                        <span className="col-span-1 text-sm font-bold">
                          {t('paymentMethod.title')}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {orderDetail?.payment?.paymentMethod ? (
                            <>
                              {orderDetail?.payment.paymentMethod ===
                                'bank-transfer' && (
                                  <span>{t('paymentMethod.bankTransfer')}</span>
                                )}
                              {orderDetail?.payment.paymentMethod ===
                                'cash' && <span>{t('paymentMethod.cash')}</span>}
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {t('order.pending')}
                            </span>
                          )}
                        </span>
                      </p>
                      <p className="flex items-center gap-1">
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
                  <Table className="min-w-full border border-collapse table-fixed">
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
                              {/* <img
                                src={`${publicFileURL}/${item.variant?.product.image}`}
                                alt={item.variant?.product.name}
                                className="object-cover h-10 rounded-md w-14 shrink-0"
                              /> */}
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

                            <TableCell className="font-extrabold text-right text-primary whitespace-nowrap">
                              {formatCurrency(item.subtotal)}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>

                </div>
                <div className="flex flex-col gap-2 p-2 border rounded-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {t('order.subtotal')}
                    </p>
                    <p className='text-muted-foreground'>{`${formatCurrency(cartTotals?.subTotalBeforeDiscount || 0)}`}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm italic text-green-500">
                      {t('order.promotionDiscount')}
                    </p>
                    <p className='text-sm italic text-green-500'>{`- ${formatCurrency(cartTotals?.promotionDiscount || 0)}`}</p>
                  </div>
                  {orderDetail?.voucher &&
                    <div className="flex justify-between w-full pb-4 border-b">
                      <h3 className="text-sm italic font-medium text-green-500">
                        {t('order.voucher')}
                      </h3>
                      <p className="text-sm italic font-semibold text-green-500">
                        - {`${formatCurrency(cartTotals?.voucherDiscount || 0)}`}
                      </p>
                    </div>}
                  {/* {orderDetail?.loss > 0 &&
                    <div className="flex justify-between w-full pb-4">
                      <h3 className="text-sm italic font-medium text-green-500">
                        {t('order.invoiceAutoDiscountUnderThreshold')}
                      </h3>
                      <p className="text-sm italic font-semibold text-green-500">
                        - {`${formatCurrency(cartTotals?.finalTotal || 0)}`}
                      </p>
                    </div>} */}
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-md">
                      {t('order.totalPayment')}
                    </p>
                    <p className="text-xl font-bold text-primary">{`${formatCurrency(cartTotals?.finalTotal || 0)}`}</p>
                  </div>
                  {/* <div className="flex items-center justify-between">
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
