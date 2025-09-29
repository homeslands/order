import _ from 'lodash'
import moment from 'moment'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { CircleX, SquareMenu, Info } from 'lucide-react'
import Lottie from "lottie-react"

import { Button } from '@/components/ui'
import { useInitiatePayment, useInitiatePublicPayment, useOrderBySlug, useValidatePublicVoucherPaymentMethod, useValidateVoucherPaymentMethod, usePaymentResolver } from '@/hooks'
import { PaymentMethod, Role, ROUTE, paymentStatus, VOUCHER_TYPE } from '@/constants'
import { calculateOrderItemDisplay, calculatePlacedOrderTotals, formatCurrency } from '@/utils'
import { ButtonLoading } from '@/components/app/loading'
import { ClientLoyaltyPointSelector, ClientPaymentMethodSelect } from '@/components/app/select'
import { Label } from '@radix-ui/react-context-menu'
import { OrderStatus, OrderTypeEnum } from '@/types'
import { OrderFlowStep, useOrderFlowStore, useUserStore } from '@/stores'
import { OrderCountdown } from '@/components/app/countdown'
import PaymentPageSkeleton from './skeleton/page'
import DownloadQrCode from '@/components/app/button/download-qr-code'
import LoadingAnimation from "@/assets/images/loading-animation.json"
import { ClientNoLoginRemoveVoucherWhenPayingDialog, ClientRemoveVoucherWhenPayingDialog } from '@/components/app/dialog'
import { VoucherListSheetInPayment } from '@/components/app/sheet'

export function ClientPaymentPage() {
  const { t } = useTranslation(['menu'])
  const { t: tHelmet } = useTranslation('helmet')
  const { userInfo } = useUserStore()
  const [searchParams] = useSearchParams()
  const slug = searchParams.get('order')
  const navigate = useNavigate()
  const { data: order, isPending, refetch: refetchOrder } = useOrderBySlug(slug as string)
  const ownerSlug = order?.result?.owner?.firstName !== 'Default' ? order?.result?.owner?.slug : null
  const { mutate: initiatePayment, isPending: isPendingInitiatePayment } = useInitiatePayment()
  const { mutate: initiatePublicPayment, isPending: isPendingInitiatePublicPayment } = useInitiatePublicPayment()
  const { mutate: validateVoucherPaymentMethod } = useValidateVoucherPaymentMethod()
  const { mutate: validatePublicVoucherPaymentMethod } = useValidatePublicVoucherPaymentMethod()
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
  const isRemovingVoucherRef = useRef<boolean>(false) // Track if voucher removal is in progress
  // const isDisabled = !paymentMethod || !slug
  const timeDefaultExpired = "Sat Jan 01 2000 07:00:00 GMT+0700 (Indochina Time)" // Khi order không tồn tại 
  const orderData = order?.result
  const {
    effectiveMethods,
    defaultMethod,
    disabledMethods,
    reasonMap,
    payButtonEnabled,
    bannerMessage,
  } = usePaymentResolver(orderData || null, userInfo?.role.name as Role, paymentData?.paymentMethod || null);
  // const { paymentMethod, setPaymentMethod, clearStore: clearPaymentMethodStore } = usePaymentMethodStore()
  const [isPolling, setIsPolling] = useState<boolean>(false)
  const [isExpired, setIsExpired] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isRemoveVoucherOption, setIsRemoveVoucherOption] = useState<boolean>(false)
  const [previousPaymentMethod, setPreviousPaymentMethod] = useState<PaymentMethod | undefined>()
  const [pendingPaymentMethod, setPendingPaymentMethod] = useState<PaymentMethod | undefined>()

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

  const voucherPaymentMethods = useMemo(() =>
    orderData?.voucher?.voucherPaymentMethods ?? [],
    [orderData?.voucher?.voucherPaymentMethods]
  );

  // Use payment method from order flow store, fallback to voucher method, then default method
  const paymentMethod = useMemo(() => {
    // Nếu đang có pending method (đang chờ remove voucher), dùng nó
    if (pendingPaymentMethod) {
      return pendingPaymentMethod
    }

    // Nếu có payment data từ store và method đó có trong effective methods, ưu tiên dùng nó
    if (paymentData?.paymentMethod && effectiveMethods.includes(paymentData.paymentMethod)) {
      return paymentData.paymentMethod
    }

    // Nếu có voucher, ưu tiên dùng method của voucher
    if (voucherPaymentMethods?.length > 0) {
      return voucherPaymentMethods[0].paymentMethod
    }

    // Nếu không có voucher, dùng method từ payment resolver
    return defaultMethod || PaymentMethod.BANK_TRANSFER
  }, [pendingPaymentMethod, paymentData?.paymentMethod, voucherPaymentMethods, defaultMethod, effectiveMethods])

  // Check if there's a conflict between voucher payment methods and user role
  const hasVoucherPaymentConflict = useMemo(() => {
    return effectiveMethods.length === 0 && !!voucher
  }, [effectiveMethods.length, voucher])

  useEffect(() => {
    if (slug) {
      // Initialize payment phase with order slug
      if (slug !== initializedSlugRef.current || currentStep !== OrderFlowStep.PAYMENT) {
        // Determine initial payment method: voucher method first, then store method, then default
        let initialPaymentMethod = PaymentMethod.BANK_TRANSFER

        if (voucherPaymentMethods?.length > 0) {
          // Use voucher's first payment method
          initialPaymentMethod = voucherPaymentMethods[0].paymentMethod as PaymentMethod
        } else if (paymentData?.paymentMethod && effectiveMethods.includes(paymentData.paymentMethod)) {
          // Use store method if it's still valid
          initialPaymentMethod = paymentData.paymentMethod
        } else if (defaultMethod) {
          // Use default method from payment resolver
          initialPaymentMethod = defaultMethod
        }

        initializePayment(
          slug,
          initialPaymentMethod
        )

        // Mark as initialized only for new slugs
        if (slug !== initializedSlugRef.current) {
          initializedSlugRef.current = slug
          qrCodeSetRef.current = false // Reset QR code tracking for new order
        }
      }
    }
  }, [slug, currentStep, initializePayment, voucherPaymentMethods, paymentData?.paymentMethod, effectiveMethods, defaultMethod])

  // Check voucher payment method compatibility on render
  useEffect(() => {
    // Skip if voucher removal is in progress to avoid double dialog
    if (isRemovingVoucherRef.current) {
      return
    }

    if (hasVoucherPaymentConflict && voucher && !isRemoveVoucherOption) {
      // Automatically show remove voucher dialog when there's a conflict
      setIsRemoveVoucherOption(true)
    }
    // Reset dialog state when voucher is removed (voucher becomes null)
    else if (!voucher && isRemoveVoucherOption) {
      setIsRemoveVoucherOption(false)
    }
  }, [hasVoucherPaymentConflict, voucher, isRemoveVoucherOption])

  // Sync order data with Order Flow Store when orderData changes
  useEffect(() => {
    if (orderData && slug && paymentData?.orderSlug === slug) {
      // Only sync if order data is different to avoid unnecessary updates
      if (!paymentData.orderData || paymentData.orderData.slug !== orderData.slug) {
        setOrderFromAPI(orderData)
      }
    }
  }, [orderData, slug, paymentData, setOrderFromAPI])

  // Separate effect for QR code to avoid infinite loop
  useEffect(() => {
    if (qrCode && qrCode.trim() !== '' && !qrCodeSetRef.current) {
      updateQrCode(qrCode)
      qrCodeSetRef.current = true
    }
  }, [qrCode, updateQrCode])

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
    // For polling decisions, ignore effectiveMethods conflicts and focus on actual payment state
    // This ensures polling continues even when voucher conflicts cause effectiveMethods to be empty
    const actualPaymentMethod = paymentData?.paymentMethod
      ? paymentData.paymentMethod  // Always use stored method if available, regardless of effectiveMethods
      : (voucherPaymentMethods?.length > 0
        ? voucherPaymentMethods[0].paymentMethod
        : defaultMethod || PaymentMethod.BANK_TRANSFER)

    // Check if we should poll for methods that finalize asynchronously (BANK_TRANSFER, POINT)
    const shouldPollForPayment = !isExpired && (
      // There's already an async payment in progress
      orderData?.payment?.paymentMethod === PaymentMethod.BANK_TRANSFER ||
      orderData?.payment?.paymentMethod === PaymentMethod.POINT ||
      // Or the actual method (not pending) is async
      actualPaymentMethod === PaymentMethod.BANK_TRANSFER ||
      actualPaymentMethod === PaymentMethod.POINT ||
      // Or current UI method is async (but only if no existing payment conflicts)
      ((paymentMethod === PaymentMethod.BANK_TRANSFER || paymentMethod === PaymentMethod.POINT) && !orderData?.payment)
    )

    if (shouldPollForPayment) {
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
      } else if (!orderData?.payment && (actualPaymentMethod === PaymentMethod.BANK_TRANSFER || actualPaymentMethod === PaymentMethod.POINT)) {
        // Case 4: No payment exists yet but actual method is async - start polling to wait for payment creation
        setIsPolling(true)
      } else {
        setIsPolling(false)
      }
    } else {
      setIsPolling(false)
    }
  }, [hasValidPaymentAndQr, isExpired, orderData, paymentMethod, paymentData, voucherPaymentMethods, defaultMethod, qrCode])

  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null

    if (isPolling) {
      pollingInterval = setInterval(async () => {
        const updatedOrder = await refetchOrder()
        const orderStatus = updatedOrder.data?.result?.status
        const updatedOrderData = updatedOrder.data?.result

        // Sync order data with Order Flow Store
        if (updatedOrderData) {
          // setOrderFromAPI(updatedOrderData)
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
          navigate(`${ROUTE.CLIENT_ORDER_SUCCESS}/${slug}`)
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
    // Lưu method hiện tại để có thể restore nếu validate fail
    setPreviousPaymentMethod(paymentMethod as PaymentMethod)

    // Set pending method ngay để UI cập nhật mượt mà
    setPendingPaymentMethod(selectedPaymentMethod)

    // Check if selected method is disabled
    const isMethodDisabled = disabledMethods.includes(selectedPaymentMethod)

    // Show dialog if method is disabled
    if (isMethodDisabled) {
      if (!isRemoveVoucherOption) {
        setIsRemoveVoucherOption(true)
      }
      return
    }

    // Normal validation flow for compatible payment methods
    if (!userInfo) {
      validatePublicVoucherPaymentMethod(
        { slug: voucher?.slug || '', paymentMethod: selectedPaymentMethod },
        {
          onSuccess: () => {
            updatePaymentMethod(selectedPaymentMethod)
            setPendingPaymentMethod(undefined)
            setPreviousPaymentMethod(undefined) // Clear previous method when successful
            setIsLoading(false)
          },
        }
      )
    } else {
      validateVoucherPaymentMethod(
        { slug: voucher?.slug || '', paymentMethod: selectedPaymentMethod },
        {
          onSuccess: () => {
            updatePaymentMethod(selectedPaymentMethod)
            setPendingPaymentMethod(undefined) // Clear pending after successful validation
            setPreviousPaymentMethod(undefined)
            setIsLoading(false)
          },
          onError: () => {
            // Restore previous method on validation failure
            setPendingPaymentMethod(undefined)
            setIsRemoveVoucherOption(true)
            setIsLoading(false)
          },
        }
      )
    }
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
              // Với POINT, chuyển sang cơ chế polling giống BANK_TRANSFER
              refetchOrder()
              setIsPolling(true)
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
        paymentMethod === PaymentMethod.POINT
      ) {
        initiatePayment(
          { orderSlug: slug, paymentMethod },
          {
            onSuccess: () => {
              // Với POINT, chuyển sang cơ chế polling giống BANK_TRANSFER
              refetchOrder()
              setIsPolling(true)
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

      {isRemoveVoucherOption && userInfo?.slug && (
        <ClientRemoveVoucherWhenPayingDialog
          voucher={voucher}
          selectedPaymentMethod={pendingPaymentMethod || paymentMethod || PaymentMethod.BANK_TRANSFER}
          previousPaymentMethod={previousPaymentMethod}
          isOpen={isRemoveVoucherOption}
          onOpenChange={setIsRemoveVoucherOption}
          order={order?.result}
          onRemoveStart={() => {
            // Set flag immediately when user clicks remove
            isRemovingVoucherRef.current = true
          }}
          onCancel={() => {
            // Reset pending payment method sau khi cancel
            setPendingPaymentMethod(undefined)
            // Reset previous payment method
            setPreviousPaymentMethod(undefined)
            // Reset voucher removal flag
            isRemovingVoucherRef.current = false
          }}
          onSuccess={() => {

            // Không reset initializedSlugRef để tránh trigger lại initializePayment
            qrCodeSetRef.current = false

            // Explicitly close dialog FIRST to prevent race conditions
            setIsRemoveVoucherOption(false)

            // Reset states sau khi đã sync order data
            setPreviousPaymentMethod(undefined)

            // Keep the payment method that user selected (pendingPaymentMethod or current paymentMethod)
            // Use the actual selected method instead of relying on state
            const selectedMethod = pendingPaymentMethod || PaymentMethod.BANK_TRANSFER

            // Set the selected method as the new pending method
            setPendingPaymentMethod(selectedMethod as PaymentMethod)

            // Update payment method in store immediately BEFORE refetch
            updatePaymentMethod(selectedMethod as PaymentMethod)

            // Refetch order data immediately
            refetchOrder().then(() => {
              // Re-initialize payment with updated order data (no voucher)
              if (slug) {
                initializePayment(slug, selectedMethod as PaymentMethod)
              }

              // Reset flag after everything is complete - allow new voucher dialogs
              setTimeout(() => {
                isRemovingVoucherRef.current = false
                setPendingPaymentMethod(undefined)
              }, 100)
            })
          }}
        />
      )}
      {isRemoveVoucherOption && !userInfo?.slug && (
        <ClientNoLoginRemoveVoucherWhenPayingDialog
          voucher={voucher}
          selectedPaymentMethod={pendingPaymentMethod || paymentMethod || PaymentMethod.BANK_TRANSFER}
          previousPaymentMethod={previousPaymentMethod}
          isOpen={isRemoveVoucherOption}
          onOpenChange={setIsRemoveVoucherOption}
          order={order?.result}
          onRemoveStart={() => {
            // Set flag immediately when user clicks remove
            isRemovingVoucherRef.current = true
          }}
          onCancel={() => {
            // Reset pending payment method sau khi cancel
            setPendingPaymentMethod(undefined)
            // Reset previous payment method
            setPreviousPaymentMethod(undefined)
            // Reset voucher removal flag
            isRemovingVoucherRef.current = false
          }}
          onSuccess={() => {
            // Không reset initializedSlugRef để tránh trigger lại initializePayment
            qrCodeSetRef.current = false

            // Explicitly close dialog FIRST to prevent race conditions
            setIsRemoveVoucherOption(false)

            // Reset states sau khi đã sync order data
            setPreviousPaymentMethod(undefined)

            // Keep the payment method that user selected (pendingPaymentMethod or current paymentMethod)
            // Use the actual selected method instead of relying on state
            const selectedMethod = pendingPaymentMethod || PaymentMethod.BANK_TRANSFER

            // Set the selected method as the new pending method
            setPendingPaymentMethod(selectedMethod as PaymentMethod)

            // Update payment method in store immediately BEFORE refetch
            updatePaymentMethod(selectedMethod as PaymentMethod)

            // Refetch order data immediately
            refetchOrder().then(() => {
              // Re-initialize payment with updated order data (no voucher)
              if (slug) {
                initializePayment(slug, selectedMethod as PaymentMethod)
              }

              // Reset flag after everything is complete - allow new voucher dialogs
              setTimeout(() => {
                isRemovingVoucherRef.current = false
              }, 100)
            })
          }}
        />
      )}

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
                    : order?.result.type === OrderTypeEnum.DELIVERY
                      ? t('order.delivery')
                      : t('order.takeAway')}
                </p>
              </div>
              {order?.result.type === OrderTypeEnum.TAKE_OUT && (
                <div className="grid grid-cols-2 gap-2">
                  <h3 className="col-span-1 text-sm font-medium">
                    {t('menu.pickupTime')}
                  </h3>
                  <span className="text-sm font-semibold">
                    {order?.result.timeLeftTakeOut === 0 ? t('menu.immediately') : `${order?.result.timeLeftTakeOut} ${t('menu.minutes')}`}
                  </span>
                </div>
              )}
              {order?.result.type === OrderTypeEnum.AT_TABLE && order?.result.table && (
                <div className="grid grid-cols-2 gap-2">
                  <h3 className="col-span-1 text-sm font-medium">
                    {t('order.tableNumber')}
                  </h3>
                  <p className="col-span-1 text-sm font-semibold">
                    {order?.result.table && t('order.tableNumber')}{' '}
                    {order?.result.table ? order?.result.table.name : ''}
                  </p>
                </div>
              )}
              {order?.result.type === OrderTypeEnum.DELIVERY && order?.result.deliveryTo && (
                <div className="grid grid-cols-2 gap-2">
                  <h3 className="col-span-1 text-sm font-medium">
                    {t('order.deliveryAddress')}
                  </h3>
                  <p className="col-span-1 text-sm font-semibold">
                    {order?.result.deliveryTo.formattedAddress}
                  </p>
                </div>
              )}
              {order?.result.type === OrderTypeEnum.DELIVERY && order?.result.deliveryPhone && (
                <div className="grid grid-cols-2 gap-2">
                  <h3 className="col-span-1 text-sm font-medium">
                    {t('order.deliveryPhone')}
                  </h3>
                  <p className="col-span-1 text-sm font-semibold">
                    {order?.result.deliveryPhone}
                  </p>
                </div>
              )}
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
                          </div>
                        </div>
                        <div className="flex col-span-1 justify-center">
                          <span className="text-xs sm:text-sm">{item.quantity || 0}</span>
                        </div>
                        <div className="col-span-1 text-end">
                          <span className="text-xs sm:text-sm">
                            {`${formatCurrency((original || 0))}`}
                          </span>
                        </div>
                      </div>
                    )
                  })()}
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
                      {`${formatCurrency(order?.result.originalSubtotal || 0)}`}
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
                  <div className="flex justify-between pb-4 w-full border-b">
                    <h3 className="text-sm italic font-medium text-primary">
                      {t('order.loyaltyPoint')}
                    </h3>
                    <p className="text-sm italic font-semibold text-primary">
                      - {`${formatCurrency(order?.result.accumulatedPointsToUse || 0)}`}
                    </p>
                  </div>
                  <div className="flex justify-between pb-4 w-full border-b">
                    <h3 className="text-sm italic font-medium text-muted-foreground/60">
                      {t('order.deliveryFee')}
                    </h3>
                    <p className="text-sm italic font-semibold text-muted-foreground/60">
                      {`${formatCurrency(order?.result.deliveryFee || 0)}`}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex justify-between w-full">
                      <h3 className="font-semibold text-md">
                        {t('order.totalPayment')}
                      </h3>
                      <p className="text-lg font-semibold text-primary">
                        {`${formatCurrency(order?.result.subtotal || 0)}`}
                      </p>
                    </div>
                    {/* Loyalty point earning note */}
                    <div className="p-2 mt-2 rounded-md bg-muted-foreground/10 text-muted-foreground">
                      <div className="flex gap-2 items-center text-xs">
                        <Info className="w-4 h-4" />
                        <span>
                          {t('paymentMethod.loyaltyPointEarningNote')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <VoucherListSheetInPayment onSuccess={() => {
          refetchOrder().then(() => {
            // Re-initialize payment with updated order data after voucher update
            if (slug) {
              initializePayment(slug, paymentMethod as PaymentMethod)
            }
          })
        }} />
        {/* Show banner message if exists */}
        {bannerMessage && (
          <div className="p-4 mb-4 text-sm text-orange-800 bg-orange-50 rounded-lg border border-orange-200">
            <p>{bannerMessage}</p>
          </div>
        )}
        {/* Payment method */}
        <ClientPaymentMethodSelect
          order={order?.result}
          paymentMethod={effectiveMethods}
          defaultMethod={paymentMethod as PaymentMethod}
          disabledMethods={disabledMethods}
          disabledReasons={reasonMap}
          qrCode={hasValidPaymentAndQr ? qrCode : ''}
          total={order?.result ? order?.result.subtotal : 0}
          onSubmit={handleSelectPaymentMethod}
        />
        {userInfo && userInfo?.slug && (
          <ClientLoyaltyPointSelector
            usedPoints={order?.result.accumulatedPointsToUse || 0}
            orderSlug={slug ?? ''}
            ownerSlug={ownerSlug ?? null}
            total={order?.result.subtotal || 0}
            onSuccess={() => {
              refetchOrder().then(() => {
                // Re-initialize payment with updated order data after voucher update
                if (slug) {
                  initializePayment(slug, paymentMethod as PaymentMethod)
                }
              })
            }}
          />
        )}
        <div className="flex flex-wrap-reverse gap-2 justify-end px-2 py-6">
          {(paymentMethod === PaymentMethod.BANK_TRANSFER ||
            paymentMethod === PaymentMethod.CASH ||
            paymentMethod === PaymentMethod.POINT) &&
            <div className="flex gap-2">
              {(hasValidPaymentAndQr && paymentMethod === PaymentMethod.BANK_TRANSFER) ?
                <DownloadQrCode qrCode={qrCode} slug={slug} />
                :
                <Button
                  disabled={isPendingInitiatePayment || isPendingInitiatePublicPayment || !payButtonEnabled}
                  className="w-fit"
                  onClick={handleConfirmPayment}
                >
                  {(isPendingInitiatePayment || isPendingInitiatePublicPayment || !payButtonEnabled) && <ButtonLoading />}
                  {t('paymentMethod.confirmPayment')}
                </Button>}
            </div>}
        </div>
      </div>
    </div>
  )
}
