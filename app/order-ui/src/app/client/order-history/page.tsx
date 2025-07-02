import { NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import moment from 'moment'
import _ from 'lodash'
import { useTranslation } from 'react-i18next'
import { CircleX, SquareMenu } from 'lucide-react'

import {
  Button,
  Separator,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { useExportPublicOrderInvoice, useIsMobile, useOrderBySlug } from '@/hooks'
import { publicFileURL, ROUTE, VOUCHER_TYPE } from '@/constants'
import PaymentStatusBadge from '@/components/app/badge/payment-status-badge'
import { calculateOrderItemDisplay, calculatePlacedOrderTotals, formatCurrency, showToast } from '@/utils'
import { ProgressBar } from '@/components/app/progress'
import { OrderStatus, OrderTypeEnum } from '@/types'
import { InvoiceTemplate } from '../public-order-detail/components'

export default function OrderHistoryPage() {
  const isMobile = useIsMobile()
  const { t } = useTranslation(['menu'])
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const order = searchParams.get('order')
  const { mutate: exportPublicOrderInvoice } = useExportPublicOrderInvoice()
  const { data: orderDetail } = useOrderBySlug(order || '')

  const orderInfo = orderDetail?.result
  const voucher = orderInfo?.voucher || null

  const displayItems = calculateOrderItemDisplay(orderInfo ? orderInfo?.orderItems : [], voucher)

  const cartTotals = calculatePlacedOrderTotals(displayItems, voucher)
  if (_.isEmpty(orderDetail?.result)) {
    return (
      <div className="container py-20 lg:h-[60vh]">
        <div className="flex flex-col items-center justify-center gap-5">
          <CircleX className="w-32 h-32 text-destructive" />
          <p className="text-center text-muted-foreground">
            {t('menu.noData')}
          </p>
          <Button variant="default" onClick={() => navigate(-1)}>
            {tCommon('common.goBack')}
          </Button>
        </div>
      </div>
    )
  }

  const handleExportInvoice = () => {
    exportPublicOrderInvoice(orderDetail?.result?.slug || '', {
      onSuccess: () => {
        showToast(tToast('toast.exportInvoiceSuccess'))
        // Load data to print
        // loadDataToPrinter(data)
      },
    })
  }
  return (
    <div className="container py-5">
      <div className="flex flex-col gap-2">
        {/* Title */}
        <div className="sticky z-10 flex flex-col items-center gap-2 py-2 -top-1">
          <span className="flex items-center justify-start w-full gap-1 text-lg">
            <SquareMenu />
            {t('order.orderDetail')}{' '}
          </span>
        </div>
        <ProgressBar step={orderInfo?.status} />
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Left, info */}
          <div className="flex flex-col w-full gap-4 lg:w-3/5">
            {/* Order info */}
            <div className="flex items-center justify-between p-3 border rounded-sm border-muted-foreground/30">
              <div className="">
                <p className="flex items-center gap-2 pb-2">
                  <span className="font-bold">
                    {t('order.order')}{' '}
                  </span>
                  <span className="text-muted-foreground">
                    #{orderInfo?.slug}
                  </span>
                </p>
                <div className="flex flex-col gap-1 text-sm font-thin">
                  <p>
                    {t('order.orderTime')}{' '}
                    <span className="text-muted-foreground">
                      {moment(orderInfo?.createdAt).format(
                        'hh:mm:ss DD/MM/YYYY',
                      )}
                    </span>
                  </p>
                  <p>
                    {t('order.note')}:{' '}
                    <span className="text-muted-foreground">
                      {orderInfo?.description || t('order.noNote')}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            {/* Order owner info */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="border rounded-sm border-muted-foreground/30 sm:grid-cols-2">
                <div className="px-3 py-2 font-bold bg-muted-foreground/10">
                  {t('order.customer')}{' '}
                </div>
                <div className="px-3 py-2">
                  <p className="text-sm text-muted-foreground">
                    {`${orderInfo?.owner?.firstName} ${orderInfo?.owner?.lastName} (${orderInfo?.owner?.phonenumber})`}
                  </p>
                </div>
              </div>
              <div className="border rounded-sm border-muted-foreground/30 sm:grid-cols-2">
                <div className="px-3 py-2 font-bold bg-muted-foreground/10">
                  {t('order.orderType')}
                </div>
                <div className="px-3 py-2 text-sm">
                  <p>
                    {orderDetail?.result?.type === OrderTypeEnum.AT_TABLE
                      ? <span>{t('order.dineIn')} - {t('order.tableNumber')}{' '}{orderDetail?.result?.table?.name}</span>
                      : t('order.takeAway')}{' '}
                  </p>
                </div>
              </div>
            </div>
            {/* Order table */}
            <div className="overflow-x-auto">
              <Table className="min-w-full border border-collapse table-auto border-muted-foreground/20">
                <TableCaption>{t('order.aListOfOrders')}</TableCaption>
                {/* Header */}
                <TableHeader className="rounded bg-muted-foreground/10">
                  <TableRow>
                    <TableHead className="w-3/5 text-left">{t('order.product')}</TableHead>
                    <TableHead className="w-2/5 text-right">{t('order.grandTotal')}</TableHead>
                  </TableRow>
                </TableHeader>

                {/* Body */}
                <TableBody>
                  {orderInfo?.orderItems?.map((item) => (
                    <TableRow key={item.slug}>
                      {/* Cột hình ảnh + thông tin */}
                      <TableCell className="flex items-center gap-5 font-bold">
                        <NavLink to={`${ROUTE.CLIENT_MENU_ITEM}?slug=${item.variant.product.slug}`} className="flex items-center gap-5">
                          {/* Hình ảnh */}
                          <div className="relative h-[3.5rem] w-[3.5rem] sm:h-[6.5rem] sm:w-[6.5rem] cursor-pointer">
                            <img
                              src={`${publicFileURL}/${item.variant.product.image}`}
                              alt={item.variant.product.name}
                              className="object-cover w-full h-full rounded-md aspect-square"
                            />
                            <div className="absolute flex items-center justify-center text-sm text-white rounded-full -bottom-3 left-10 w-7 h-7 sm:-bottom-3 sm:-right-3 sm:left-auto bg-primary">
                              x{item.quantity}
                            </div>
                          </div>

                          {/* Thông tin sản phẩm */}
                          <div className="flex flex-col items-start">
                            <span className="text-sm font-semibold truncate">{item?.variant?.product?.name}</span>
                            {item?.promotion && item?.promotion?.value > 0 ? (
                              <div className="flex flex-row items-center gap-1">
                                <span className="text-xs font-normal">Size {item?.variant?.size?.name.toUpperCase()}</span>
                                <span className="text-xs line-through text-muted-foreground/60">
                                  {formatCurrency(item?.variant?.price || 0)}
                                </span>
                                <span className="font-semibold text-primary">
                                  {formatCurrency(item?.variant?.price * (1 - item?.promotion?.value / 100))}
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col text-xs text-muted-foreground">
                                <span>
                                  Size {item?.variant?.size?.name.toUpperCase()} - {formatCurrency(item?.variant?.price || 0)}
                                </span>
                                <span>
                                  {t('order.note')}: {item?.note}
                                </span>
                              </div>
                            )}
                          </div>
                        </NavLink>
                      </TableCell>

                      {/* Cột tổng giá */}
                      <TableCell className="w-1/4 font-semibold text-right">
                        {(() => {
                          const displayItem = displayItems.find(di => di.slug === item.slug)
                          const original = item.variant.price || 0
                          const priceAfterPromotion = displayItem?.priceAfterPromotion || 0
                          const finalPrice = displayItem?.finalPrice || 0

                          const isSamePriceVoucher =
                            voucher?.type === VOUCHER_TYPE.SAME_PRICE_PRODUCT &&
                            voucher?.voucherProducts?.some(vp => vp.product?.slug === item.variant.product.slug)

                          const hasPromotionDiscount = (displayItem?.promotionDiscount || 0) > 0

                          const displayPrice = isSamePriceVoucher
                            ? finalPrice * item.quantity
                            : hasPromotionDiscount
                              ? priceAfterPromotion * item.quantity
                              : original * item.quantity

                          const shouldShowLineThrough =
                            isSamePriceVoucher || hasPromotionDiscount

                          return (
                            <div className="flex items-center gap-1">
                              {shouldShowLineThrough && (
                                <span className="text-sm line-through text-muted-foreground">
                                  {formatCurrency(original * item.quantity)}
                                </span>
                              )}
                              <span className="font-bold text-primary">
                                {formatCurrency(displayPrice)}
                              </span>
                            </div>
                          )
                        })()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Right, payment*/}
          <div className="flex flex-col w-full gap-2 lg:w-2/5">
            {/* Payment method, status */}
            <div className="border rounded-sm h-fit border-muted-foreground/30">
              <div className="px-3 py-4 font-bold bg-muted-foreground/10">
                {t('paymentMethod.title')}
              </div>
              {orderInfo?.payment ? (
                <div className="px-3 py-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm">
                      {orderInfo?.payment?.paymentMethod && (
                        <>
                          {orderInfo?.payment.paymentMethod ===
                            'bank-transfer' && (
                              <span className="italic">
                                {t('paymentMethod.bankTransfer')}
                              </span>
                            )}
                          {orderInfo?.payment.paymentMethod ===
                            'cash' && (
                              <span className="italic">
                                {t('paymentMethod.cash')}
                              </span>
                            )}
                        </>
                      )}
                    </span>
                    <div className="flex">
                      {orderInfo?.payment && (
                        <PaymentStatusBadge
                          status={orderInfo?.payment?.statusCode}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-3 py-4">
                  <p className="text-sm text-muted-foreground">
                    {t('paymentMethod.notPaid')}
                  </p>
                </div>
              )}
            </div>
            {/* Total */}
            <div className="border rounded-sm border-muted-foreground/30">
              <div className="px-3 py-3 font-bold bg-muted-foreground/10">
                {t('order.paymentInformation')}
              </div>
              <div className="flex flex-col gap-2 px-3 py-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {t('order.subTotal')}
                  </p>
                  <p className="text-sm">{`${formatCurrency(cartTotals?.subTotalBeforeDiscount || 0)}`}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {t('order.discount')}
                  </p>
                  <p className="text-sm text-muted-foreground">{`- ${formatCurrency(cartTotals?.promotionDiscount || 0)}`}</p>
                </div>
                {orderInfo?.voucher &&
                  <div className="flex justify-between w-full pb-4 border-b">
                    <h3 className="text-sm italic font-medium text-green-500">
                      {t('order.voucher')}
                    </h3>
                    <p className="text-sm italic font-semibold text-green-500">
                      - {`${formatCurrency(cartTotals?.voucherDiscount || 0)}`}
                    </p>
                  </div>}
                {orderInfo && orderInfo?.loss > 0 &&
                  <div className="flex justify-between w-full pb-4">
                    <h3 className="text-sm italic font-medium text-green-500">
                      {t('order.invoiceAutoDiscountUnderThreshold')}
                    </h3>
                    <p className="text-sm italic font-semibold text-green-500">
                      - {`${formatCurrency(orderInfo?.loss)}`}
                    </p>
                  </div>}
                <Separator className="my-2" />
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-md">
                    {t('order.totalPayment')}
                  </p>
                  <p className="text-2xl font-extrabold text-primary">{`${formatCurrency(cartTotals?.finalTotal || 0)}`}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    ({orderInfo?.orderItems?.length} {t('order.product')})
                  </p>
                  {/* <p className="text-xs text-muted-foreground">
                    ({t('order.vat')})
                  </p> */}
                </div>
              </div>
            </div>
            {isMobile && orderInfo?.status === OrderStatus.PAID && (
              <div className='flex flex-col items-center justify-center w-full mt-12'>
                <span className='text-lg text-muted-foreground'>
                  {t('order.invoice')}
                </span>
                <InvoiceTemplate
                  order={orderInfo}
                />
                <Button onClick={() => {
                  handleExportInvoice()
                }}>
                  {t('order.exportInvoice')}
                </Button>
              </div>
            )}
            {/* Return order button */}
            <div className="flex justify-between gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  navigate(`${ROUTE.CLIENT_PROFILE}?tab=history`)
                }}
              >
                {tCommon('common.goBack')}
              </Button>
              {orderDetail?.result?.status === OrderStatus.PENDING ?
                (<Button
                  className="w-fit bg-primary"
                  onClick={() => {
                    navigate(`${ROUTE.CLIENT_PAYMENT}?order=${orderDetail?.result?.slug}`)
                  }}
                >
                  {tCommon('common.checkout')}
                </Button>) : null}
            </div>
          </div>
        </div>
        {!isMobile && orderInfo?.status === OrderStatus.PAID && (
          <div className='flex flex-col items-center justify-center w-full mt-12'>
            <span className='text-lg text-muted-foreground'>
              {t('order.invoice')}
            </span>
            <InvoiceTemplate
              order={orderInfo}
            />

            <Button onClick={() => {
              handleExportInvoice()
            }}>
              {t('order.exportInvoice')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
