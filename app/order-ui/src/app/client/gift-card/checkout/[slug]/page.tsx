import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState, useEffect, useCallback } from 'react'
import {
  useGetCardOrder,
  useCancelCardOrder,
  useInitiateCardOrderPayment,
} from '@/hooks/use-gift-card'
import { useGiftCardPolling } from '@/hooks/use-gift-card-polling'
import ErrorPage from '@/app/error-page'
import { ROUTE } from '@/constants'
import { OrderCountdown } from '@/components/app/countdown/OrderCountdown'
import {
  IGiftCardCartItem,
  IReceiverGiftCardCart,
  OrderStatus,
  IUserInfo,
} from '@/types'
import CancelCardOrderDialog from '@/components/app/dialog/cancel-gift-card-order-dialog'
import { useGiftCardStore } from '@/stores'
import { showToast, showErrorToast } from '@/utils'
import {
  CustomerInfo,
  OrderInfo,
  GiftCardDetailsTable,
  PaymentMethodSection,
  CheckoutHeader,
  PaymentQRCodeSection,
  LoadingState,
  ExpiredState,
} from './components'

export default function GiftCardCheckoutWithSlugPage() {
  // Extract slug parameter from URL
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  // Initialize translation hook for internationalization
  const { t } = useTranslation(['giftCard', 'common'])
  // State management
  const [isExpired, setIsExpired] = useState<boolean>(false)
  const [shouldStartPolling, setShouldStartPolling] = useState<boolean>(false)

  // Fetch initial gift card order data
  const { data: orderResponse, isLoading, error } = useGetCardOrder(slug || '')
  // Cancel card order mutation
  const cancelCardOrderMutation = useCancelCardOrder()

  // Get gift card store functions
  const { setGiftCardItem } = useGiftCardStore()
  // Setup polling for payment status updates
  const {
    data: pollingOrderResponse,
    isPolling,
    startPolling,
    stopPolling,
    pollAttempts,
  } = useGiftCardPolling({
    slug: slug || '',
    shouldPoll: shouldStartPolling && !isExpired,
    pollingInterval: 30000, // Poll every 30 seconds
    onPaymentSuccess: () => {
      // Navigate to gift card success page when payment is completed
      navigate(`${ROUTE.CLIENT_GIFT_CARD_SUCCESS}/${slug}`)
    },
    onExpired: () => {
      setIsExpired(true)
    },
    onCancelled: () => {
      // Handle cancelled order
      showToast(t('giftCard.orderCancelledSuccessfully'))
      // Restore gift card to local storage
      restoreGiftCardToLocal() // Navigate back to gift card page
      navigate(ROUTE.CLIENT_GIFT_CARD)
    },
  })

  const {
    mutate: initiatePayment,
    isPending: isPendingInitiatePayment,
    isSuccess: isSuccessInitiatePayment,
    data: initiatePaymentData,
  } = useInitiateCardOrderPayment()

  // Use polling data if available, otherwise use initial data
  const currentOrderData = pollingOrderResponse?.result || orderResponse?.result
  // Function to restore gift card to local storage when cancelled
  const restoreGiftCardToLocal = useCallback(() => {
    if (currentOrderData) {
      // Build receipients for cart display (without userInfo)
      const receipients: IReceiverGiftCardCart[] =
        currentOrderData.receipients.map((recipient) => ({
          recipientSlug: recipient.recipientSlug,
          quantity: recipient.quantity,
          message: recipient.message || '',
          userInfo: {
            phonenumber: recipient.phone || '',
            firstName: recipient.name || '',
            lastName: '',
            slug: recipient.recipientSlug,
          } as IUserInfo,
        }))

      // Restore gift card item for cart display
      const giftCardItem: IGiftCardCartItem = {
        slug: currentOrderData.cardSlug,
        title: currentOrderData.cardTitle,
        description: '',
        price: currentOrderData.cardPrice,
        points: currentOrderData.cardPoint,
        image: currentOrderData.cardImage,
        quantity: currentOrderData.quantity,
        id: currentOrderData.cardId,
        receipients: receipients,
      }
      setGiftCardItem(giftCardItem)
    }
  }, [currentOrderData, setGiftCardItem])
  // Handle cancel card order
  const handleCancelOrder = useCallback(() => {
    if (!currentOrderData) return

    cancelCardOrderMutation.mutate(currentOrderData.slug, {
      onSuccess: () => {
        showToast(
          t(
            'giftCard.orderCancelledSuccessfully',
            'Order cancelled successfully',
          ),
        )
        // Stop polling immediately
        stopPolling()
        // Restore gift card to local storage
        restoreGiftCardToLocal()
        // Navigate back to gift card page
        navigate(ROUTE.CLIENT_GIFT_CARD)
      },
      onError: (_error) => {
        showErrorToast(1001)
      },
    })
  }, [
    currentOrderData,
    cancelCardOrderMutation,
    t,
    stopPolling,
    restoreGiftCardToLocal,
    navigate,
  ])
  // Handle payment initiation
  const handleInitiatePayment = useCallback(() => {
    if (!currentOrderData?.slug) return

    initiatePayment(currentOrderData.slug, {
      onSuccess: (_data) => {
        showToast(
          t('giftCard.paymentInitiated', 'Payment initiated successfully'),
        )
      },
      onError: (_error) => {
        showErrorToast(1001)
      },
    })
  }, [currentOrderData?.slug, initiatePayment, t])

  // Handle countdown expiration
  const handleExpired = useCallback(
    (value: boolean) => {
      setIsExpired(value)
      if (value) {
        stopPolling()
      }
    },
    [stopPolling],
  )

  // Start polling based on payment conditions
  useEffect(() => {
    if (currentOrderData && !isExpired) {
      const shouldPoll =
        currentOrderData.paymentStatus !== OrderStatus.COMPLETED &&
        currentOrderData.status !== OrderStatus.FAILED

      setShouldStartPolling(shouldPoll)

      if (shouldPoll && !isPolling) {
        startPolling()
      } else if (!shouldPoll && isPolling) {
        stopPolling()
      }
    }
  }, [
    currentOrderData,
    isExpired,
    isPolling,
    startPolling,
    stopPolling,
    navigate,
    slug,
  ])
  // Show loading spinner while fetching initial data
  if (isLoading) {
    return <LoadingState />
  }

  // Show error page if request failed or no data found
  if (error || !currentOrderData) {
    return <ErrorPage />
  }

  // Show expired state
  if (isExpired) {
    return (
      <ExpiredState onNavigateBack={() => navigate(ROUTE.CLIENT_GIFT_CARD)} />
    )
  }
  // Extract order data from response
  const orderData = currentOrderData
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-5xl p-6">
        {/* Order countdown component */}
        <OrderCountdown
          createdAt={orderData.orderDate}
          setIsExpired={handleExpired}
        />

        {/* Page title with order slug and polling indicator */}
        <CheckoutHeader
          orderData={orderData}
          isPolling={isPolling}
          pollAttempts={pollAttempts}
        />

        {/* Two-column grid layout for customer and order information */}
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Customer Information Section */}
          <CustomerInfo orderData={orderData} />

          {/* Order Information Section */}
          <OrderInfo orderData={orderData} />
        </div>

        {/* Gift Card Details Table */}
        <GiftCardDetailsTable orderData={orderData} />

        {/* Payment Method Section */}
        <PaymentMethodSection />

        {/* QR Code and Payment Summary Section */}
        <div className="flex justify-between gap-6">
          {/* Cancel order button - only show if order is pending */}
          {orderData.status === OrderStatus.PENDING && (
            <CancelCardOrderDialog
              onConfirm={handleCancelOrder}
              isLoading={cancelCardOrderMutation.isPending}
              disabled={cancelCardOrderMutation.isPending || isExpired}
            />
          )}

          <PaymentQRCodeSection
            orderData={orderData}
            isSuccessInitiatePayment={isSuccessInitiatePayment}
            initiatePaymentData={initiatePaymentData}
            isPendingInitiatePayment={isPendingInitiatePayment}
            isExpired={isExpired}
            onInitiatePayment={handleInitiatePayment}
          />
        </div>
      </div>
    </div>
  )
}
