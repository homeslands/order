import { NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import moment from 'moment'
import _ from 'lodash'
import { useTranslation } from 'react-i18next'
import { CircleX, SquareMenu } from 'lucide-react'

import {
  Badge,
  Button,
  Separator,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableRow,
  Textarea,
} from '@/components/ui'
import { useExportPublicOrderInvoice, useIsMobile, useOrderBySlug } from '@/hooks'
import { PaymentMethod, publicFileURL, ROUTE, VOUCHER_TYPE } from '@/constants'
import PaymentStatusBadge from '@/components/app/badge/payment-status-badge'
import { calculateOrderItemDisplay, calculatePlacedOrderTotals, capitalizeFirstLetter, formatCurrency, showToast } from '@/utils'
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
        <div className="flex flex-col gap-5 justify-center items-center">
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
        <div className="flex sticky -top-1 z-10 flex-col gap-2 items-center py-2">
          <span className="flex gap-1 justify-start items-center w-full text-lg">
            <SquareMenu />
            {t('order.orderDetail')}{' '}
          </span>
        </div>
        <ProgressBar step={orderInfo?.status} />
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Left, info */}
          <div className="flex flex-col gap-4 w-full lg:w-3/5">
            {/* Order info */}
            <div className="flex justify-between items-center p-3 bg-white rounded-sm border dark:bg-transparent">
              <div className="">
                <p className="flex gap-2 items-center pb-2">
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
                  {
                    orderInfo?.type === OrderTypeEnum.DELIVERY && (
                      <>
                        <p>
                          {t('order.deliveryAddress')}:{' '}
                          <span className="text-muted-foreground">
                            {orderInfo?.deliveryTo?.formattedAddress}
                          </span>
                        </p>
                        <p>
                          {t('order.deliveryPhone')}:{' '}
                          <span className="text-muted-foreground">
                            {orderInfo?.deliveryPhone}
                          </span>
                        </p>
                      </>
                    )
                  }
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
              <div className="bg-white rounded-sm border sm:grid-cols-2 dark:bg-transparent">
                <div className="px-3 py-2 font-bold rounded-t-sm bg-muted-foreground/20">
                  {t('order.customer')}{' '}
                </div>
                <div className="px-3 py-2">
                  <p className="text-sm text-muted-foreground">
                    {`${orderInfo?.owner?.firstName} ${orderInfo?.owner?.lastName} (${orderInfo?.owner?.phonenumber})`}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-sm border sm:grid-cols-2 dark:bg-transparent">
                <div className="px-3 py-2 font-bold rounded-t-sm bg-muted-foreground/20">
                  {t('order.orderType')}
                </div>
                {orderInfo?.type === OrderTypeEnum.TAKE_OUT ? (
                  <div className="px-3 py-2 text-sm">
                    <p>
                      {orderDetail?.result?.type === OrderTypeEnum.AT_TABLE
                        ? <span>{t('order.dineIn')} - {t('order.tableNumber')}{' '}{orderDetail?.result?.table?.name}</span>
                        : t('order.takeAway')}{' '} - {orderDetail?.result?.timeLeftTakeOut === 0 ? t('menu.immediately') : `${orderDetail?.result?.timeLeftTakeOut} ${t('menu.minutes')}`}
                    </p>
                  </div>
                ) : (
                  <div className="px-3 py-2 text-sm">
                    <p>
                      {orderDetail?.result?.type === OrderTypeEnum.AT_TABLE
                        ? <span>{t('order.dineIn')} - {t('order.tableNumber')}{' '}{orderDetail?.result?.table?.name}</span>
                        : orderDetail?.result?.type === OrderTypeEnum.DELIVERY
                          ? t('menu.delivery')
                          : t('order.takeAway')}
                    </p>
                  </div>
                )}
              </div>
            </div>
            {/* Order table */}
            <div className="overflow-x-auto pb-4 bg-white rounded-sm border dark:bg-transparent">
              <Table className="min-w-full table-auto">
                <TableCaption>{t('order.aListOfOrders')}</TableCaption>
                {/* Body */}
                <TableBody>
                  {orderInfo?.orderItems?.map((item) => {
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

                    const shouldShowLineThrough = isSamePriceVoucher || hasPromotionDiscount

                    return (
                      <>
                        {/* Row chính */}
                        <TableRow key={item.slug}>
                          <TableCell className="w-3/4 font-bold">
                            <NavLink
                              to={`${ROUTE.CLIENT_MENU_ITEM}?slug=${item.variant.product.slug}`}
                              className="flex gap-4 items-start sm:gap-5 sm:flex-row"
                            >
                              <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
                                <img
                                  src={`${publicFileURL}/${item.variant.product.image}`}
                                  alt={item.variant.product.name}
                                  className="object-cover w-full h-full rounded-md"
                                />
                                <div className="flex absolute -right-2 -bottom-2 justify-center items-center w-6 h-6 text-xs font-semibold text-white rounded-full shadow bg-primary">
                                  x{item.quantity}
                                </div>
                              </div>

                              <div className="flex flex-col gap-1 min-w-0">
                                <span className="text-sm font-semibold truncate">
                                  {item?.variant?.product?.name}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-xs w-fit border-primary text-primary bg-primary/10"
                                >
                                  {capitalizeFirstLetter(item?.variant?.size?.name)}
                                </Badge>
                              </div>
                            </NavLink>
                          </TableCell>

                          {/* Cột tổng giá */}
                          <TableCell className="w-1/4 font-semibold text-right align-top">
                            <div className="flex flex-col gap-1 items-end">
                              {shouldShowLineThrough && (
                                <span className="text-sm line-through text-muted-foreground">
                                  {formatCurrency(original * item.quantity)}
                                </span>
                              )}
                              <span className="font-bold text-primary">
                                {formatCurrency(displayPrice)}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Row ghi chú - chiếm trọn hàng */}
                        {item.note && (
                          <TableRow key={`${item.slug}-note`} className="bg-muted/20">
                            <TableCell colSpan={2}>
                              <div className="flex gap-1 items-center text-sm text-muted-foreground">
                                <Textarea
                                  value={item.note}
                                  readOnly
                                  className="w-full text-xs resize-none sm:text-sm h-fit"
                                  placeholder={t('order.noNote')}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Right, payment*/}
          <div className="flex flex-col gap-2 w-full lg:w-2/5">
            {/* Payment method, status */}
            <div className={`border ${orderInfo?.payment?.statusMessage === OrderStatus.COMPLETED ? 'border-green-500 bg-green-50' : 'border-destructive bg-red-50'} rounded-sm h-fit dark:bg-transparent`}>
              <div className={`px-3 py-4 font-bold rounded-t-sm ${orderInfo?.payment?.statusMessage === OrderStatus.COMPLETED ? 'text-green-700 bg-green-200' : 'text-destructive bg-red-200'}`} >
                {t('paymentMethod.title')}
              </div>
              {orderInfo?.payment ? (
                <div className="px-3 py-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm">
                      {orderInfo?.payment?.paymentMethod && (
                        <>
                          {orderInfo?.payment.paymentMethod ===
                            PaymentMethod.BANK_TRANSFER && (
                              <span className="italic">
                                {t('paymentMethod.bankTransfer')}
                              </span>
                            )}
                          {orderInfo?.payment.paymentMethod ===
                            PaymentMethod.CASH && (
                              <span className="italic">
                                {t('paymentMethod.cash')}
                              </span>
                            )}
                          {orderInfo?.payment.paymentMethod ===
                            PaymentMethod.POINT && (
                              <span className="italic">
                                {t('paymentMethod.point')}
                              </span>
                            )}
                          {orderInfo?.payment.paymentMethod ===
                            PaymentMethod.CREDIT_CARD && (
                              <div className="flex flex-col gap-1">
                                <span className="italic">
                                  {t('paymentMethod.creditCard')}
                                </span>
                                <span className="text-muted-foreground">
                                  {t('paymentMethod.transactionId')}: {orderInfo?.payment?.transactionId}
                                </span>
                              </div>
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
            <div className="bg-white rounded-sm border dark:bg-transparent">
              <div className="px-3 py-3 font-bold rounded-t-sm bg-muted-foreground/20">
                {t('order.paymentInformation')}
              </div>
              <div className="flex flex-col gap-2 px-3 py-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {t('order.subTotal')}
                  </p>
                  <p className="text-sm">{`${formatCurrency(cartTotals?.subTotalBeforeDiscount || 0)}`}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {t('order.discount')}
                  </p>
                  <p className="text-sm text-muted-foreground">{`- ${formatCurrency(cartTotals?.promotionDiscount || 0)}`}</p>
                </div>
                {orderInfo?.voucher &&
                  <div className="flex justify-between pb-4 w-full border-b">
                    <h3 className="text-sm italic font-medium text-green-500">
                      {t('order.voucher')}
                    </h3>
                    <p className="text-sm italic font-semibold text-green-500">
                      - {`${formatCurrency(cartTotals?.voucherDiscount || 0)}`}
                    </p>
                  </div>}

                {orderInfo && orderInfo?.accumulatedPointsToUse > 0 &&
                  <div className="flex justify-between pb-4 w-full">
                    <h3 className="text-sm italic font-medium text-primary">
                      {t('order.loyaltyPoint')}
                    </h3>
                    <p className="text-sm italic font-semibold text-primary">
                      - {`${formatCurrency(orderInfo?.accumulatedPointsToUse)}`}
                    </p>
                  </div>}
                {orderInfo?.type === OrderTypeEnum.DELIVERY && orderInfo?.deliveryFee > 0 &&
                  <div className="flex justify-between pb-4 w-full">
                    <h3 className="text-sm italic font-medium text-muted-foreground/60">
                      {t('order.deliveryFee')}
                    </h3>
                    <p className="text-sm italic font-semibold text-muted-foreground/60">
                      {`${formatCurrency(orderInfo?.deliveryFee)}`}
                    </p>
                  </div>}
                {orderInfo && orderInfo?.loss > 0 &&
                  <div className="flex justify-between pb-4 w-full">
                    <h3 className="text-sm italic font-medium text-green-500">
                      {t('order.invoiceAutoDiscountUnderThreshold')}
                    </h3>
                    <p className="text-sm italic font-semibold text-green-500">
                      - {`${formatCurrency(orderInfo?.loss)}`}
                    </p>
                  </div>}
                <Separator className="my-2" />
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-md">
                    {t('order.totalPayment')}
                  </p>
                  <p className="text-2xl font-extrabold text-primary">{`${formatCurrency(orderDetail?.result?.subtotal || 0)}`}</p>
                </div>
                <div className="flex justify-between items-center">
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
              <div className='flex flex-col gap-3 justify-center items-center mt-8 w-full'>
                <span className='text-lg text-muted-foreground'>
                  {t('order.invoice')}
                </span>
                <InvoiceTemplate
                  order={orderInfo}
                />
                <Button onClick={() => {
                  handleExportInvoice()
                }} className='w-full sm:w-fit'>
                  {t('order.exportInvoice')}
                </Button>
              </div>
            )}
            {/* Return order button */}
            <div className="flex gap-2 justify-between">
              <Button
                variant="outline"
                className="w-full"
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
          <div className='flex flex-col justify-center items-center mt-12 w-full'>
            <span className='text-lg text-muted-foreground'>
              {t('order.invoice')}
            </span>
            <InvoiceTemplate
              order={orderInfo}
            />

            <Button onClick={() => {
              handleExportInvoice()
            }} className='mt-4 w-full sm:w-fit'>
              {t('order.exportInvoice')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
