import { useEffect } from 'react'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

import { useOrderBySlug } from '@/hooks'
import { IOrder, OrderTypeEnum } from '@/types'
import {
  Separator,
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
import { ShowInvoiceDialog } from '../dialog'
import { formatCurrency } from '@/utils'
import { OrderStatusBadge, PaymentStatusBadge } from '../badge'
import { publicFileURL } from '@/constants'

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

  const { data, refetch } = useOrderBySlug(order?.slug as string)
  const orderDetail = data?.result

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

  const originalTotal = orderDetail ? orderDetail.orderItems.reduce((sum, item) => sum + item.variant.price * item.quantity, 0) : 0

  const discount = orderDetail ? orderDetail.orderItems.reduce((sum, item) => sum + (item.promotion ? item.variant.price * item.quantity * (item.promotion.value / 100) : 0), 0) : 0

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
                    {orderDetail?.description && (
                      <div className="flex items-center w-full text-sm">
                        <h3 className="w-20 text-sm font-semibold">
                          {t('order.note')}
                        </h3>
                        <p className="p-2 w-full rounded-md border sm:col-span-8 border-muted-foreground/20">{orderDetail?.description}</p>
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
                <div className="flex flex-col gap-2 w-full">
                  {/* Payment method, status */}
                  <div className="rounded-sm border">
                    <div className="px-3 py-2">
                      <p className="flex flex-col gap-1 items-start pb-2">
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
                  <Table className="min-w-full border border-collapse table-auto">
                    <TableCaption>A list of orders.</TableCaption>
                    <TableHeader className={`rounded bg-muted-foreground/10 dark:bg-transparent`}>
                      <TableRow>
                        <TableHead className="">{t('order.product')}</TableHead>
                        <TableHead>{t('order.size')}</TableHead>
                        <TableHead>{t('order.quantity')}</TableHead>
                        <TableHead className="text-start">
                          {t('order.unitPrice')}
                        </TableHead>
                        <TableHead className="text-right">
                          {t('order.grandTotal')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderDetail?.orderItems?.map((item) => (
                        <TableRow key={item.slug}>
                          <TableCell className="flex gap-1 items-center font-bold">
                            <img
                              src={`${publicFileURL}/${item.variant && item.variant.product.image}`}
                              alt={item.variant && item.variant.product.image}
                              className="object-cover w-20 h-12 rounded-lg sm:h-16 sm:w-24"
                            />
                            {item.variant && item.variant.product.name}
                          </TableCell>
                          <TableCell>{item.variant && item.variant.size.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            {item.promotion && item.promotion.value > 0 ? (
                              <div className="flex gap-1 justify-start items-center">
                                <span className="text-sm line-through text-muted-foreground">
                                  {`${formatCurrency(item?.variant?.price || 0)}`}
                                </span>
                                <span className="text-sm sm:text-lg text-primary">
                                  {`${formatCurrency(item?.variant?.price * (1 - item?.promotion?.value / 100))}`}
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-1 justify-start items-start">
                                <span className="text-sm text-muted-foreground">
                                  {`${formatCurrency(item?.variant?.price || 0)}`}
                                </span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-lg font-extrabold text-right text-primary">
                            {`${formatCurrency(item?.subtotal)}`}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex flex-col gap-2 p-2 rounded-sm border">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      {t('order.subtotal')}
                    </p>
                    <p className='text-muted-foreground'>{`${formatCurrency(originalTotal || 0)}`}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm italic text-green-500">
                      {t('order.discount')}
                    </p>
                    <p className='text-sm italic text-green-500'>{`- ${formatCurrency(discount || 0)}`}</p>
                  </div>
                  {orderDetail?.voucher &&
                    <div className="flex justify-between pb-4 w-full border-b">
                      <h3 className="text-sm italic font-medium text-green-500">
                        {t('order.voucher')}
                      </h3>
                      <p className="text-sm italic font-semibold text-green-500">
                        - {`${formatCurrency((originalTotal - discount) * ((orderDetail.voucher.value) / 100))}`}
                      </p>
                    </div>}
                  <Separator />
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-md">
                      {t('order.totalPayment')}
                    </p>
                    <p className="text-xl font-bold text-primary">{`${formatCurrency(orderDetail?.subtotal || 0)}`}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground/80">({t('order.vat')})</p>
                  </div>
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
            <ShowInvoiceDialog order={order} />
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
