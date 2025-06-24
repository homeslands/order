import { useCallback, useEffect, useState } from 'react'
import _ from 'lodash'
import moment from 'moment'
import Lottie from "lottie-react";
import { Helmet } from 'react-helmet'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CircleX, SquareMenu } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui'
import { useExportPayment, useInitiatePayment, useOrderBySlug } from '@/hooks'
import { PaymentMethod, paymentStatus, ROUTE, VOUCHER_TYPE } from '@/constants'
import { PaymentMethodSelect } from '@/app/system/payment'
import { calculateOrderItemDisplay, calculatePlacedOrderTotals, formatCurrency, loadDataToPrinter, showToast } from '@/utils'
import { ButtonLoading } from '@/components/app/loading'
import { OrderStatus } from '@/types'
import PaymentPageSkeleton from "@/app/client/payment/skeleton/page"
import { OrderCountdown } from '@/components/app/countdown/OrderCountdown'
import { useCartItemStore, usePaymentMethodStore } from '@/stores'
import DownloadQrCode from '@/components/app/button/download-qr-code'
import LoadingAnimation from "@/assets/images/loading-animation.json"

export default function PaymentPage() {
  const [searchParams] = useSearchParams()
  const { t } = useTranslation(['menu'])
  const { t: tToast } = useTranslation(['toast'])
  const { t: tHelmet } = useTranslation('helmet')
  const slug = searchParams.get('order')
  const navigate = useNavigate()
  const { data: order, isPending, refetch: refetchOrder } = useOrderBySlug(slug as string)
  const { mutate: initiatePayment, isPending: isPendingInitiatePayment } =
    useInitiatePayment()
  const { mutate: exportPayment, isPending: isPendingExportPayment } =
    useExportPayment()
  const { clearCart } = useCartItemStore()

  const [isPolling, setIsPolling] = useState<boolean>(false)
  const [isExpired, setIsExpired] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { paymentMethod, setPaymentMethod } = usePaymentMethodStore()
  const isDisabled = !paymentMethod || !slug
  const timeDefaultExpired = "Sat Jan 01 2000 07:00:00 GMT+0700 (Indochina Time)" // Khi order không tồn tại 
  const orderData = order?.result

  const orderItems = order?.result?.orderItems || []
  const voucher = order?.result?.voucher || null

  const displayItems = calculateOrderItemDisplay(orderItems, voucher)

  const cartTotals = calculatePlacedOrderTotals(displayItems, voucher)

  // Get QR code from orderData
  const qrCode = orderData?.payment?.qrCode || ''
  const paymentSlug = orderData?.payment?.slug || ''

  // Check if payment amount matches order subtotal and QR code is valid
  const hasValidPaymentAndQr = orderData?.payment?.amount != null &&
    orderData?.subtotal != null &&
    orderData.payment.amount === orderData.subtotal &&
    qrCode && qrCode.trim() !== ''

  // Debug logs to check payment validation
  useEffect(() => {
    if (orderData) {
      // Remove debug logs for production
    }
  }, [orderData, qrCode, hasValidPaymentAndQr, paymentMethod])

  useEffect(() => {
    if (isExpired) {
      setIsPolling(false)
    }
  }, [isExpired])

  // Start polling when QR code exists and payment is valid, or when payment method is selected
  useEffect(() => {
    if (!isExpired && paymentMethod === PaymentMethod.BANK_TRANSFER) {
      if (hasValidPaymentAndQr) {
        // Case 1: Valid QR code - check if payment is completed
        if (orderData.payment.statusMessage === paymentStatus.COMPLETED) {
          setIsPolling(false)
        } else {
          setIsPolling(true)
        }
      } else if (orderData?.payment && orderData.payment.amount !== orderData.subtotal) {
        // Case 2: Payment exists but amount doesn't match - start polling for status updates
        setIsPolling(true)
      } else if (orderData?.payment && !qrCode && orderData.payment.amount === orderData.subtotal) {
        // Case 3: Payment exists but no QR code (amount < 2000) - start polling
        setIsPolling(true)
      } else if (!orderData?.payment) {
        // Case 4: No payment exists yet - start polling to wait for payment creation
        setIsPolling(true)
      } else {
        setIsPolling(false)
      }
    } else {
      setIsPolling(false)
    }
  }, [hasValidPaymentAndQr, isExpired, orderData, paymentMethod, qrCode])

  //polling order status every 3 seconds
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null

    if (isPolling) {
      pollingInterval = setInterval(async () => {
        const updatedOrder = await refetchOrder()
        const orderStatus = updatedOrder.data?.result?.status
        if (orderStatus === OrderStatus.PAID) {
          if (pollingInterval) clearInterval(pollingInterval)
          clearCart()
          // Always ensure loading is false before navigating
          setIsLoading(false)
          navigate(`${ROUTE.ORDER_SUCCESS}/${slug}`)
        } else {
          // Turn off loading if order is updated but not yet paid (for orders without QR code)
          const updatedOrderData = updatedOrder.data?.result
          if (updatedOrderData?.payment && !updatedOrderData.payment.qrCode &&
            updatedOrderData.payment.amount === updatedOrderData.subtotal) {
            setIsLoading(false)
          }
        }
      }, 2000)
    }

    return () => {
      if (pollingInterval) clearInterval(pollingInterval)
    }
  }, [isPolling, refetchOrder, navigate, slug, clearCart])

  const handleSelectPaymentMethod = (selectedPaymentMethod: PaymentMethod) => {
    setPaymentMethod(selectedPaymentMethod)
    // Polling logic is handled in useEffect above based on paymentMethod and payment status
  }

  const handleConfirmPayment = () => {
    if (!slug || !paymentMethod) return
    setIsLoading(true)

    if (paymentMethod === PaymentMethod.BANK_TRANSFER) {
      initiatePayment(
        { orderSlug: slug, paymentMethod },
        {
          onSuccess: (data) => {
            refetchOrder()
            setIsPolling(true)
            // Only turn off loading if we get a QR code (amount > 2000)
            if (data.result.qrCode) {
              setIsLoading(false)
            }
          },
          onError: () => {
            setIsLoading(false)
          }
        },
      )
    } else if (paymentMethod === PaymentMethod.CASH) {
      initiatePayment(
        { orderSlug: slug, paymentMethod },
        {
          onSuccess: () => {
            clearCart()
            navigate(`${ROUTE.ORDER_SUCCESS}/${slug}`)
          },
          onError: () => {
            setIsLoading(false)
          }
        },
      )
    }
  }

  const handleExportPayment = () => {
    if (!slug) return
    exportPayment(paymentSlug, {
      onSuccess: (data: Blob) => {
        showToast(tToast('toast.exportPaymentSuccess'))
        // Load data to print
        loadDataToPrinter(data)
      },
    })
  }

  const handleExpire = useCallback((value: boolean) => {
    setIsExpired(value)
  }, [])

  if (isExpired) {
    return (
      <div className="container py-20 lg:h-[60vh]">
        <div className="flex flex-col gap-5 justify-center items-center">
          <CircleX className="w-32 h-32 text-destructive" />
          <p className="text-center text-muted-foreground">
            {t('order.orderExpired')}
          </p>
          <Button variant="default" onClick={() => navigate(-1)}>
            {t('order.goBackToMenu')}
          </Button>
        </div>
      </div>
    )
  }

  if (isPending) return <PaymentPageSkeleton />

  return (
    <div>
      {isLoading && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-white bg-opacity-40">
          <div className="w-64 h-64">
            <Lottie animationData={LoadingAnimation} loop={true} />
          </div>
        </div>
      )}
      <Helmet>
        <meta charSet='utf-8' />
        <title>
          {tHelmet('helmet.payment.title')}
        </title>
        <meta name='description' content={tHelmet('helmet.bankConfig.title')} />
      </Helmet>
      <OrderCountdown createdAt={order?.result.createdAt || timeDefaultExpired} setIsExpired={handleExpire} />
      <span className="flex gap-1 justify-start items-center w-full text-lg">
        <SquareMenu />
        {t('menu.payment')}
        <span className="text-muted-foreground">#{slug}</span>
      </span>
      <div className="flex flex-col gap-3 mt-2 w-full">
        {order && (
          <div className="space-y-2 w-full">
            {/* Customer Information */}
            <div className="grid grid-cols-1 justify-between items-center py-2 rounded-sm bg-background sm:grid-cols-2">
              <div className="flex flex-col col-span-1 gap-1 sm:border-r">
                <div className="grid grid-cols-2 gap-2">
                  <h3 className="col-span-1 text-sm font-bold">
                    {t('order.customerName')}
                  </h3>
                  <p className="text-sm font-semibold">{`${order.result.owner.lastName} ${order.result.owner.firstName}`}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <h3 className="col-span-1 text-sm font-bold">
                    {t('order.orderDate')}
                  </h3>
                  <span className="text-sm">
                    {moment(order.result.createdAt).format(
                      'HH:mm DD/MM/YYYY',
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <h3 className="col-span-1 text-sm font-bold">
                    {t('order.phoneNumber')}
                  </h3>
                  <p className="text-sm">
                    {order.result.owner.phonenumber}
                  </p>
                </div>
              </div>
              {/* Delivery Information */}
              <div className="flex flex-col col-span-1 gap-1 sm:px-4">
                <div className="grid grid-cols-2 gap-2">
                  <h3 className="col-span-1 text-sm font-bold">
                    {t('order.deliveryMethod')}
                  </h3>
                  <p className="col-span-1 text-sm">
                    {order.result.type === 'at-table'
                      ? t('order.dineIn')
                      : t('order.takeAway')}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <h3 className="col-span-1 text-sm font-bold">
                    {t('order.location')}
                  </h3>
                  <p className="col-span-1 text-sm">
                    {order.result.table ? order.result.table.name : ''}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <h3 className="col-span-1 text-sm font-bold">
                    {t('order.note')}
                  </h3>
                  <p className="col-span-1 text-sm">
                    {order.result.description || t('order.noNote')}
                  </p>
                </div>
              </div>
            </div>
            {/* Order Information */}
            <div className="grid grid-cols-4 px-4 py-3 mb-2 w-full text-sm font-thin rounded-md bg-muted-foreground/10">
              <span className="col-span-1">{t('order.product')}</span>
              <span className="col-span-1">{t('order.unitPrice')}</span>
              <span className="col-span-1 text-center">
                {t('order.quantity')}
              </span>
              <span className="col-span-1 text-right">
                {t('order.grandTotal')}
              </span>
            </div>
            <div className="flex flex-col w-full rounded-md border bg-background">
              {order?.result.orderItems.map((item) => (
                <div
                  key={item.slug}
                  className="grid gap-4 items-center p-4 pb-4 w-full border-b"
                >
                  <div className="grid flex-row grid-cols-4 items-center w-full">
                    <div className="flex col-span-1 gap-2 w-full">
                      <div className="flex flex-col gap-2 justify-start items-center w-full sm:flex-row sm:justify-center">
                        <span className="text-[12px] sm:text-sm lg:text-base font-bold truncate text-wrap w-full">
                          {item.variant.product.name}
                        </span>
                      </div>
                    </div>
                    <div className="flex col-span-1 items-center">
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
                          ? finalPrice
                          : hasPromotionDiscount
                            ? priceAfterPromotion
                            : original

                        const shouldShowLineThrough =
                          isSamePriceVoucher || hasPromotionDiscount

                        return (
                          <div className="flex gap-1 items-center">
                            {shouldShowLineThrough && original !== finalPrice && (
                              <span className="text-sm line-through text-muted-foreground">
                                {formatCurrency(original)}
                              </span>
                            )}
                            <span className="font-bold text-primary">
                              {formatCurrency(displayPrice)}
                            </span>
                          </div>
                        )
                      })()}
                    </div>
                    <div className="flex col-span-1 justify-center">
                      <span className="text-sm">
                        {item.quantity || 0}
                      </span>
                    </div>
                    <div className="col-span-1 text-right">
                      <span className="text-sm">
                        {`${formatCurrency((item.subtotal || 0))}`}
                      </span>
                    </div>
                  </div>
                  {item.note && (
                    <div className="grid grid-cols-9 items-center w-full text-sm">
                      <span className="col-span-2 font-semibold sm:col-span-1">{t('order.note')}: </span>
                      <span className="col-span-7 p-2 w-full rounded-md border sm:col-span-8 border-muted-foreground/40">{item.note}</span>
                    </div>
                  )}
                </div>
              ))}
              <div className="flex flex-col gap-2 items-end p-4 w-full">
                <div className="flex w-[20rem] flex-col">
                  <div className="flex justify-between pb-4 w-full">
                    <h3 className="text-sm font-medium">
                      {t('order.total')}
                    </h3>
                    <p className="text-sm font-semibold">
                      {`${formatCurrency(cartTotals?.subTotalBeforeDiscount || 0)}`}
                    </p>
                  </div>
                  <div className="flex justify-between pb-4 w-full">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {t('order.promotionDiscount')}
                    </h3>
                    <p className="text-sm font-semibold text-muted-foreground">
                      - {`${formatCurrency(cartTotals?.promotionDiscount || 0)}`}
                    </p>
                  </div>
                  <div className="flex justify-between pb-4 w-full border-b">
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
                      <p className="text-2xl font-extrabold text-primary">
                        {`${formatCurrency(order.result.subtotal)}`}
                      </p>
                    </div>
                    {/* <span className="text-xs text-muted-foreground">
                          ({t('order.vat')})
                        </span> */}
                  </div>
                </div>
              </div>
            </div>
            {/* Payment method */}
            <PaymentMethodSelect
              qrCode={hasValidPaymentAndQr ? qrCode : ''}
              total={order.result ? order.result.subtotal : 0}
              paymentMethod={paymentMethod}
              onSubmit={handleSelectPaymentMethod}
            />
          </div>
        )}
        <div className="flex flex-wrap-reverse gap-2 justify-between px-2 py-6">
          <Button
            className="w-fit"
            onClick={() => navigate(-1)}
          >
            {t('order.backToMenu')}
          </Button>
          {(paymentMethod === PaymentMethod.BANK_TRANSFER ||
            paymentMethod === PaymentMethod.CASH) && (
              <div className="flex gap-2 justify-end">
                {(hasValidPaymentAndQr && paymentMethod === PaymentMethod.BANK_TRANSFER) ?
                  <>
                    <DownloadQrCode qrCode={qrCode} slug={slug} />
                    <Button
                      disabled={isDisabled || isPendingExportPayment}
                      className="w-fit"
                      onClick={handleExportPayment}
                    >
                      {isPendingExportPayment && <ButtonLoading />}
                      {t('paymentMethod.exportPayment')}
                    </Button>
                  </>
                  :
                  <Button
                    disabled={isDisabled || isPendingInitiatePayment}
                    className="w-fit"
                    onClick={handleConfirmPayment}
                  >
                    {isPendingInitiatePayment && <ButtonLoading />}
                    {t('paymentMethod.confirmPayment')}
                  </Button>}
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
