import _ from 'lodash'
import moment from 'moment'
import { useCallback, useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { CircleX, SquareMenu } from 'lucide-react'
import Lottie from "lottie-react"

import { Button } from '@/components/ui'
import { useInitiatePayment, useInitiatePublicPayment, useOrderBySlug } from '@/hooks'
import { PaymentMethod, Role, ROUTE, paymentStatus, VOUCHER_TYPE } from '@/constants'
import { calculateOrderItemDisplay, calculatePlacedOrderTotals, formatCurrency } from '@/utils'
import { ButtonLoading } from '@/components/app/loading'
import { ClientPaymentMethodSelect } from '@/components/app/select'
import { Label } from '@radix-ui/react-context-menu'
import { OrderStatus, OrderTypeEnum } from '@/types'
import { OrderFlowStep, useOrderFlowStore, useUserStore } from '@/stores'
import { OrderCountdown } from '@/components/app/countdown'
import PaymentPageSkeleton from './skeleton/page'
import DownloadQrCode from '@/components/app/button/download-qr-code'
import LoadingAnimation from "@/assets/images/loading-animation.json"

export function ClientPaymentPage() {
  const { t } = useTranslation(['menu'])
  const { t: tHelmet } = useTranslation('helmet')
  const { userInfo } = useUserStore()
  const [searchParams] = useSearchParams()
  const slug = searchParams.get('order')
  const navigate = useNavigate()
  const { data: order, isPending, refetch: refetchOrder } = useOrderBySlug(slug as string)
  const { mutate: initiatePayment, isPending: isPendingInitiatePayment } = useInitiatePayment()
  const { mutate: initiatePublicPayment, isPending: isPendingInitiatePublicPayment } = useInitiatePublicPayment()
  const {
    currentStep,
    paymentData,
    initializePayment,
    updatePaymentMethod,
    updateQrCode,
    setOrderFromAPI,
    clearPaymentData
  } = useOrderFlowStore()

  const qrCodeSetRef = useRef<boolean>(false) // Track if QR code has been set to avoid repeated calls
  const initializedSlugRef = useRef<string>('') // Track initialized slug to avoid repeated initialization
  const paymentMethod = paymentData?.paymentMethod
  // const isDisabled = !paymentMethod || !slug
  const timeDefaultExpired = "Sat Jan 01 2000 07:00:00 GMT+0700 (Indochina Time)" // Khi order không tồn tại 
  const orderData = order?.result
  // const { paymentMethod, setPaymentMethod, clearStore: clearPaymentMethodStore } = usePaymentMethodStore()
  const [isPolling, setIsPolling] = useState<boolean>(false)
  const [isExpired, setIsExpired] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const orderItems = order?.result?.orderItems || []
  const voucher = order?.result?.voucher || null

  const displayItems = calculateOrderItemDisplay(orderItems, voucher)
  const cartTotals = calculatePlacedOrderTotals(displayItems, voucher)

  // Get QR code from orderData
  const qrCode = orderData?.payment?.qrCode || ''

  // Check if payment amount matches order subtotal and QR code is valid
  const hasValidPaymentAndQr = orderData?.payment?.amount != null &&
    orderData?.subtotal != null &&
    orderData.payment.amount === orderData.subtotal &&
    qrCode && qrCode.trim() !== ''

  useEffect(() => {
    if (slug && slug !== initializedSlugRef.current) {
      // ✅ Initialize payment phase with order slug
      if (currentStep !== OrderFlowStep.PAYMENT) {
        initializePayment(slug)
      }

      // Mark as initialized
      initializedSlugRef.current = slug
      qrCodeSetRef.current = false // Reset QR code tracking for new order
    }
  }, [slug, currentStep, initializePayment]) // ✅ Remove function dependencies

  // Sync order data with Order Flow Store when orderData changes
  useEffect(() => {
    if (orderData && slug && paymentData?.orderSlug === slug) {
      // Only sync if order data is different to avoid unnecessary updates
      if (!paymentData.orderData || paymentData.orderData.slug !== orderData.slug) {
        setOrderFromAPI(orderData)
      }
    }
  }, [orderData, slug, paymentData, setOrderFromAPI]) // ✅ Remove paymentData and setOrderFromAPI from dependencies

  // Separate effect for QR code to avoid infinite loop
  useEffect(() => {
    if (qrCode && qrCode.trim() !== '' && !qrCodeSetRef.current) {
      updateQrCode(qrCode)
      qrCodeSetRef.current = true
    }
  }, [qrCode, updateQrCode]) // ✅ Remove updateQrCode from dependencies

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

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

  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null

    if (isPolling) {
      pollingInterval = setInterval(async () => {
        const updatedOrder = await refetchOrder()
        const orderStatus = updatedOrder.data?.result?.status
        const updatedOrderData = updatedOrder.data?.result

        // Sync order data with Order Flow Store
        if (updatedOrderData) {
          setOrderFromAPI(updatedOrderData)
        }

        // Only update QR code if it's not already set and becomes available during polling
        if (updatedOrderData?.payment?.qrCode &&
          updatedOrderData.payment.qrCode.trim() !== '' &&
          !qrCodeSetRef.current) {
          updateQrCode(updatedOrderData.payment.qrCode)
          qrCodeSetRef.current = true
        }

        if (orderStatus === OrderStatus.PAID) {
          if (pollingInterval) clearInterval(pollingInterval)
          clearPaymentData()
          // Always ensure loading is false before navigating
          setIsLoading(false)
          navigate(`${ROUTE.ORDER_SUCCESS}/${slug}`)
        } else {
          // Turn off loading if order is updated but not yet paid (for orders without QR code)
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
  }, [isPolling, refetchOrder, navigate, slug, updateQrCode, qrCodeSetRef, clearPaymentData, setIsLoading, orderData, paymentData, setOrderFromAPI])

  const handleSelectPaymentMethod = (selectedPaymentMethod: PaymentMethod) => {
    updatePaymentMethod(selectedPaymentMethod)
    // Polling logic is handled in useEffect above based on paymentMethod and payment status
  }

  const handleConfirmPayment = () => {
    if (!slug || !paymentMethod) return
    setIsExpired(false)
    setIsLoading(true)

    if (!userInfo) {
      if (paymentMethod === PaymentMethod.BANK_TRANSFER) {
        initiatePublicPayment(
          { orderSlug: slug, paymentMethod },
          {
            onSuccess: (data) => {
              refetchOrder()
              setIsPolling(true)
              // Set QR code immediately from response if available
              if (data.result.qrCode && data.result.qrCode.trim() !== '') {
                updateQrCode(data.result.qrCode)
                qrCodeSetRef.current = true
              }
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
      } else if (
        paymentMethod === PaymentMethod.CASH ||
        paymentMethod === PaymentMethod.POINT
      ) {
        initiatePublicPayment(
          { orderSlug: slug, paymentMethod },
          {
            onSuccess: () => {
              clearPaymentData()
              navigate(`${ROUTE.CLIENT_ORDER_SUCCESS}/${slug}`)
            },
            onError: () => {
              setIsLoading(false)
            }
          },
        )
      }
    } else if (userInfo.role.name === Role.CUSTOMER) {
      if (paymentMethod === PaymentMethod.BANK_TRANSFER) {
        initiatePayment(
          { orderSlug: slug, paymentMethod },
          {
            onSuccess: (data) => {
              refetchOrder()
              setIsPolling(true)
              // Set QR code immediately from response if available
              if (data.result.qrCode && data.result.qrCode.trim() !== '') {
                updateQrCode(data.result.qrCode)
                qrCodeSetRef.current = true
              }
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
      } else if (
        paymentMethod === PaymentMethod.CASH ||
        paymentMethod === PaymentMethod.POINT
      ) {
        initiatePayment(
          { orderSlug: slug, paymentMethod },
          {
            onSuccess: () => {
              clearPaymentData()
              navigate(`${ROUTE.CLIENT_ORDER_SUCCESS}/${slug}`)
            },
            onError: () => {
              setIsLoading(false)
            }
          },
        )
      }
    } else {
      if (paymentMethod === PaymentMethod.BANK_TRANSFER) {
        initiatePayment(
          { orderSlug: slug, paymentMethod },
          {
            onSuccess: (data) => {
              refetchOrder()
              setIsPolling(true)
              // Set QR code immediately from response if available
              if (data.result.qrCode && data.result.qrCode.trim() !== '') {
                updateQrCode(data.result.qrCode)
                qrCodeSetRef.current = true
              }
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
              clearPaymentData()
              navigate(`${ROUTE.CLIENT_ORDER_SUCCESS}/${slug}`)
            },
            onError: () => {
              setIsLoading(false)
            }
          },
        )
      }
    }
  }

  const handleExpire = useCallback((value: boolean) => {
    setIsExpired(value)
    if (value) {
      // Clear payment store when order expires
      clearPaymentData()
    }
  }, [clearPaymentData])

  if (!isPending && isExpired) {
    return (
      <div className="container py-20 lg:h-[60vh]">
        <div className="flex flex-col gap-5 justify-center items-center">
          <CircleX className="w-32 h-32 text-destructive" />
          <p className="text-center text-muted-foreground">
            {t('paymentMethod.timeExpired')}
          </p>
          <NavLink to={ROUTE.CLIENT_MENU}>
            <Button variant="default">
              {t('order.backToMenu')}
            </Button>
          </NavLink>
        </div>
      </div>
    )
  }
  if (isPending) return <PaymentPageSkeleton />
  return (
    <div className="container py-10">
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
        <meta name='description' content={tHelmet('helmet.payment.title')} />
      </Helmet>
      <OrderCountdown createdAt={order?.result.createdAt || timeDefaultExpired} setIsExpired={handleExpire} />
      <span className="flex gap-1 justify-start items-center w-full text-lg">
        <SquareMenu />
        {t('menu.payment')}
        <span className="text-muted-foreground">#{slug}</span>
      </span>

      <div className="flex flex-col gap-3 mt-5">
        <div className="flex flex-col gap-5 lg:flex-row">
          {/* Customer info */}
          <div className="flex flex-col gap-3 w-full lg:w-1/3">
            <div className="flex gap-1 px-4 py-2 rounded-md bg-muted-foreground/10">
              <Label className="text-md">{t('paymentMethod.userInfo')}</Label>
            </div>
            <div className="flex flex-col gap-3 p-3 mt-2 rounded border">
              <div className="grid grid-cols-2 gap-2">
                <h3 className="col-span-1 text-sm font-medium">
                  {t('order.customerName')}
                </h3>
                <p className="text-sm font-semibold">
                  {order?.result?.owner?.lastName || order?.result?.owner?.firstName
                    ? `${order.result.owner.lastName || ''} ${order.result.owner.firstName || ''}`.trim()
                    : order?.result?.owner?.phonenumber || 'Không có tên'}
                </p>

              </div>
              <div className="grid grid-cols-2 gap-2">
                <h3 className="col-span-1 text-sm font-medium">
                  {t('order.orderDate')}
                </h3>
                <span className="text-sm font-semibold">
                  {moment(order?.result.createdAt).format('HH:mm:ss DD/MM/YYYY')}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <h3 className="col-span-1 text-sm font-medium">
                  {t('order.phoneNumber')}
                </h3>
                <p className="text-sm font-semibold">
                  {order?.result.owner.phonenumber}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <h3 className="col-span-1 text-sm font-medium">
                  {t('order.deliveryMethod')}
                </h3>
                <p className="col-span-1 text-sm font-semibold">
                  {order?.result.type === OrderTypeEnum.AT_TABLE
                    ? t('order.dineIn')
                    : t('order.takeAway')}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <h3 className="col-span-1 text-sm font-medium">
                  {t('order.location')}
                </h3>
                <p className="col-span-1 text-sm font-semibold">
                  {order?.result.table && t('order.tableNumber')}{' '}
                  {order?.result.table ? order?.result.table.name : ''}
                </p>
              </div>
              {order?.result.description && (
                <div className="grid grid-cols-2 gap-2">
                  <h3 className="col-span-1 text-sm font-medium">
                    {t('order.orderNote')}
                  </h3>
                  <p className="col-span-1 text-sm font-semibold">
                    {order?.result.description}
                  </p>
                </div>
              )}
            </div>
            {userInfo && userInfo.role.name !== Role.CUSTOMER && (
              <NavLink to={`${ROUTE.CLIENT_UPDATE_ORDER}/${slug}`} className='w-full'>
                <Button className='w-full'>
                  {t('order.updateOrder')}
                </Button>
              </NavLink>
            )}
          </div>
          {/* Order detail */}
          <div className="w-full lg:w-2/3">
            <div className="grid grid-cols-5 px-4 py-3 mb-2 w-full text-sm font-thin rounded-md bg-muted-foreground/10">
              <span className="col-span-2 text-xs">{t('order.product')}</span>
              <span className="col-span-1 text-xs">{t('order.unitPrice')}</span>
              <span className="col-span-1 text-xs text-center">
                {t('order.quantity')}
              </span>
              <span className="col-span-1 text-xs text-end">
                {t('order.grandTotal')}
              </span>
            </div>
            <div className="flex flex-col w-full rounded-md border">
              {order?.result.orderItems.map((item) => (
                <div
                  key={item.slug}
                  className="grid gap-4 items-center p-4 pb-4 w-full rounded-t-md border-b"
                >
                  <div className="grid flex-row grid-cols-5 items-center w-full">
                    <div className="flex col-span-2 gap-2 w-full">
                      <div className="flex flex-col gap-2 justify-start items-center w-full sm:flex-row sm:justify-center">
                        <span className="overflow-hidden w-full text-sm font-bold truncate whitespace-nowrap sm:text-lg text-ellipsis">
                          {item.variant.product.name}
                        </span>
                      </div>
                    </div>
                    <div className="flex col-span-1 items-center">
                      <div className='flex gap-2 items-center'>
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
                                <span className="text-xs line-through sm:text-sm text-muted-foreground">
                                  {formatCurrency(original)}
                                </span>
                              )}
                              <span className="text-xs font-bold sm:text-sm text-primary">
                                {formatCurrency(displayPrice)}
                              </span>
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                    <div className="flex col-span-1 justify-center">
                      <span className="text-xs sm:text-sm">{item.quantity || 0}</span>
                    </div>
                    <div className="col-span-1 text-end">
                      <span className="text-xs sm:text-sm">
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
              <div className="flex flex-col gap-2 items-end px-2 py-4 w-full">
                <div className="flex w-[20rem] flex-col gap-2">
                  <div className="flex justify-between pb-4 w-full border-b">
                    <h3 className="text-sm font-medium">{t('order.total')}</h3>
                    <p className="text-sm font-semibold text-muted-foreground">
                      {`${formatCurrency(cartTotals?.subTotalBeforeDiscount || 0)}`}
                    </p>
                  </div>
                  <div className="flex justify-between pb-4 w-full border-b">
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
                      <p className="text-lg font-semibold text-primary">
                        {`${formatCurrency(cartTotals?.finalTotal || 0)}`}
                      </p>
                    </div>
                    {/* <span className="text-xs text-muted-foreground">
                      ({t('order.vat')})
                    </span> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Payment method */}
        <ClientPaymentMethodSelect
          paymentMethod={paymentMethod || PaymentMethod.BANK_TRANSFER}
          qrCode={hasValidPaymentAndQr ? qrCode : ''}
          total={order?.result ? order?.result.subtotal : 0}
          onSubmit={handleSelectPaymentMethod}
        />
        <div className="flex flex-wrap-reverse gap-2 justify-end px-2 py-6">
          {(paymentMethod === PaymentMethod.BANK_TRANSFER ||
            paymentMethod === PaymentMethod.CASH ||
            paymentMethod === PaymentMethod.POINT) &&
            <div className="flex gap-2">
              {(hasValidPaymentAndQr && paymentMethod === PaymentMethod.BANK_TRANSFER) ?
                <DownloadQrCode qrCode={qrCode} slug={slug} />
                :
                <Button
                  disabled={isPendingInitiatePayment || isPendingInitiatePublicPayment}
                  className="w-fit"
                  onClick={handleConfirmPayment}
                >
                  {(isPendingInitiatePayment || isPendingInitiatePublicPayment) && <ButtonLoading />}
                  {t('paymentMethod.confirmPayment')}
                </Button>}
            </div>}
        </div>
      </div>
    </div>
  )
}
