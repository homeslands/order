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
import { PaymentMethod, ROUTE } from '@/constants'
import { PaymentMethodSelect } from '@/app/system/payment'
import { formatCurrency, loadDataToPrinter, showToast } from '@/utils'
import { ButtonLoading } from '@/components/app/loading'
import { OrderStatus } from '@/types'
import PaymentPageSkeleton from "@/app/client/payment/skeleton/page"
import { OrderCountdown } from '@/components/app/countdown/OrderCountdown'
import { useCartItemStore, usePaymentMethodStore, usePaymentStore } from '@/stores'
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

  const { setOrderSlug } = usePaymentStore()
  const { clearCart } = useCartItemStore()

  const [isPolling, setIsPolling] = useState<boolean>(false)
  const [isExpired, setIsExpired] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { qrCode, setQrCode, paymentMethod, setPaymentMethod, paymentSlug, setPaymentSlug } = usePaymentMethodStore()
  const isDisabled = !paymentMethod || !slug
  const timeDefaultExpired = "Sat Jan 01 2000 07:00:00 GMT+0700 (Indochina Time)" // Khi order không tồn tại 
  // calculate original total
  const originalTotal = order?.result.orderItems ?
    order.result.orderItems.reduce((sum, item) => sum + item.variant.price * item.quantity, 0) : 0;

  const discount = order?.result.orderItems ?
    order.result.orderItems.reduce((sum, item) => sum + ((item.promotion ? item.variant.price * item.quantity * (item.promotion.value / 100) : 0)), 0) : 0;

  const voucherDiscount = order?.result.voucher ? (originalTotal - discount) * ((order.result.voucher.value) / 100) : 0;
  useEffect(() => {
    if (isExpired) {
      setIsPolling(false)
    }
  }, [isExpired])

  useEffect(() => {
    if (qrCode && paymentSlug && !isExpired) {
      setIsPolling(true)
    }
  }, [qrCode, paymentSlug, isExpired])

  //polling order status every 3 seconds
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null

    if (isPolling) {
      pollingInterval = setInterval(async () => {
        const updatedOrder = await refetchOrder()
        const orderStatus = updatedOrder.data?.result?.status
        if (orderStatus === OrderStatus.PAID) {
          if (pollingInterval) clearInterval(pollingInterval)
          setOrderSlug('')
          clearCart()
          // Always ensure loading is false before navigating
          setIsLoading(false)
          navigate(`${ROUTE.ORDER_SUCCESS}/${slug}`)
        }
      }, 3000)
    }

    return () => {
      if (pollingInterval) clearInterval(pollingInterval)
    }
  }, [isPolling, refetchOrder, navigate, slug, setOrderSlug, clearCart])

  const handleSelectPaymentMethod = (selectedPaymentMethod: PaymentMethod) => {
    setPaymentMethod(selectedPaymentMethod)
    if (selectedPaymentMethod === PaymentMethod.BANK_TRANSFER && qrCode) setIsPolling(true)
    else setIsPolling(false) // Stop polling after selecting payment method
  }

  const handleConfirmPayment = () => {
    if (!slug || !paymentMethod) return
    setIsLoading(true)

    if (paymentMethod === PaymentMethod.BANK_TRANSFER) {
      initiatePayment(
        { orderSlug: slug, paymentMethod },
        {
          onSuccess: (data) => {
            setPaymentSlug(data.result.slug)
            setQrCode(data.result.qrCode)
            setOrderSlug(slug)
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
      <div>
        <div className="flex sticky top-0 z-10 flex-col gap-2 items-center">
          <div className="flex flex-col gap-3 w-full">
            {order && (
              <div className="space-y-2 w-full">
                {/* Customer Information */}
                <div className="grid grid-cols-1 justify-between items-center p-4 rounded-sm bg-background sm:grid-cols-2">
                  <div className="flex flex-col col-span-1 gap-1 sm:border-r sm:px-4">
                    <div className="grid grid-cols-2 gap-2">
                      <h3 className="col-span-1 text-sm font-medium">
                        {t('order.customerName')}
                      </h3>
                      <p className="text-sm font-semibold">{`${order.result.owner.lastName} ${order.result.owner.firstName}`}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <h3 className="col-span-1 text-sm font-medium">
                        {t('order.orderDate')}
                      </h3>
                      <span className="text-sm font-semibold">
                        {moment(order.result.createdAt).format(
                          'HH:mm DD/MM/YYYY',
                        )}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <h3 className="col-span-1 text-sm font-medium">
                        {t('order.phoneNumber')}
                      </h3>
                      <p className="text-sm font-semibold">
                        {order.result.owner.phonenumber}
                      </p>
                    </div>
                  </div>
                  {/* Delivery Information */}
                  <div className="flex flex-col col-span-1 gap-1 sm:px-4">
                    <div className="grid grid-cols-2 gap-2">
                      <h3 className="col-span-1 text-sm font-medium">
                        {t('order.deliveryMethod')}
                      </h3>
                      <p className="col-span-1 text-sm font-semibold">
                        {order.result.type === 'at-table'
                          ? t('order.dineIn')
                          : t('order.takeAway')}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <h3 className="col-span-1 text-sm font-medium">
                        {t('order.location')}
                      </h3>
                      <p className="col-span-1 text-sm font-semibold">
                        {order.result.table ? order.result.table.name : ''}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <h3 className="col-span-1 text-sm font-medium">
                        {t('order.note')}
                      </h3>
                      <p className="col-span-1 text-sm font-semibold">
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
                  <span className="col-span-1 text-center">
                    {t('order.grandTotal')}
                  </span>
                </div>
                <div className="flex flex-col w-full rounded-md bg-background">
                  {order?.result.orderItems.map((item) => (
                    <div
                      key={item.slug}
                      className="grid gap-4 items-center p-4 pb-4 w-full rounded-t-md border-b"
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
                          <span className="flex gap-2 items-center text-sm">
                            {item?.promotion?.value &&
                              <span className='line-through text-muted-foreground/70 sm:block'>
                                {`${formatCurrency(item.variant.price || 0)}`}
                              </span>}
                            <span className="text-sm font-bold text-primary">
                              {`${formatCurrency(item.subtotal / item.quantity || 0)}`}
                            </span>
                          </span>
                        </div>
                        <div className="flex col-span-1 justify-center">
                          <span className="text-sm">
                            {item.quantity || 0}
                          </span>
                        </div>
                        <div className="col-span-1 text-center">
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
                  <div className="flex flex-col gap-2 items-end p-4 pr-10 w-full">
                    <div className="flex w-[20rem] flex-col gap-2">
                      <div className="flex justify-between pb-4 w-full border-b">
                        <h3 className="text-sm font-medium">
                          {t('order.total')}
                        </h3>
                        <p className="text-sm font-semibold">
                          {`${formatCurrency(originalTotal || 0)}`}
                        </p>
                      </div>
                      <div className="flex justify-between pb-4 w-full border-b">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          {t('order.discount')}
                        </h3>
                        <p className="text-sm font-semibold text-muted-foreground">
                          - {`${formatCurrency(discount || 0)}`}
                        </p>
                      </div>
                      {voucherDiscount > 0 && (
                        <div className="flex justify-between pb-4 w-full border-b">
                          <h3 className="text-sm italic font-medium text-green-500">
                            {t('order.voucher')}
                          </h3>
                          <p className="text-sm italic font-semibold text-green-500">
                            - {`${formatCurrency(voucherDiscount || 0)}`}
                          </p>
                        </div>
                      )}
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
                  qrCode={qrCode ? qrCode : ''}
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
                    {paymentSlug && qrCode && paymentMethod === PaymentMethod.BANK_TRANSFER ?
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
      </div>
    </div>
  )
}
