import { useNavigate } from "react-router-dom"
import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { User, Phone, MapPin, FileText, QrCode, AlertCircle } from "lucide-react"

import { Badge } from "@/components/ui"
import { calculateCartItemDisplay, calculateCartTotals, calculateOrderItemDisplay, calculatePlacedOrderTotals, formatCurrency, transformOrderItemToOrderDetail } from "@/utils"
import { OrderSuccess, Logo } from "@/assets/images"
import { useCartItemStore, useOrderFlowStore, usePaymentMethodStore, OrderFlowStep } from "@/stores"
import { PaymentMethod, paymentStatus, ROUTE, VOUCHER_TYPE } from "@/constants"
import { useOrderBySlug } from "@/hooks"
import { OrderStatus, OrderTypeEnum, IOrderItem, IOrderDetail } from "@/types"
import { IDisplayCartItem, IDisplayOrderItem } from "@/types/dish.type"
import { CustomerDisplayCountdown } from "@/components/app/countdown"

export default function CustomerDisplayPage() {
    const { t } = useTranslation("menu")
    const navigate = useNavigate()
    const {
        orderingData,
        paymentData,
        updatingData,
        currentStep,
        isHydrated: orderFlowIsHydrated,
        clearUpdatingData
    } = useOrderFlowStore()
    const cartIsHydrated = orderFlowIsHydrated
    // ✅ Get updating data from Order Flow Store instead  
    const orderItemsFromStoreToUpdate = updatingData?.updateDraft
    const updateOrderIsHydrated = orderFlowIsHydrated && currentStep === OrderFlowStep.UPDATING

    // ✅ Get payment data from Order Flow Store instead of PaymentMethodStore
    const orderSlug = paymentData?.orderSlug || ''
    const paymentMethod = paymentData?.paymentMethod || null
    const paymentQrCode = paymentData?.qrCode || ''
    const [isPolling, setIsPolling] = useState<boolean>(false)
    const [isExpired, setIsExpired] = useState<boolean>(false)
    const [, setIsLoading] = useState<boolean>(false)
    const [showOrderSuccess, setShowOrderSuccess] = useState<boolean>(false)
    const timeDefaultExpired = "Sat Jan 01 2000 07:00:00 GMT+0700 (Indochina Time)" // Khi order không tồn tại

    // Only fetch order when we have a valid orderSlug and are in payment step
    const shouldFetchOrder = currentStep === OrderFlowStep.PAYMENT && orderSlug && orderSlug.trim() !== ''
    const { data: order, refetch: refetchOrder, isLoading: isOrderLoading } = useOrderBySlug(shouldFetchOrder ? orderSlug : '')
    // Clear orderData when not in payment step or no valid orderSlug
    const orderData = shouldFetchOrder ? order?.result : null
    const orderItems = orderData?.orderItems || []
    const transformedOrderItems = orderItemsFromStoreToUpdate ? transformOrderItemToOrderDetail(orderItemsFromStoreToUpdate.orderItems || []) : []

    // Computed values - Ưu tiên theo logic mới: payment method store → update order store → cart → orderData
    // Determine data source priority based on available data
    const determineDataSource = () => {
        const hasPaymentData = currentStep === OrderFlowStep.PAYMENT &&
            paymentData?.orderSlug &&
            paymentData.orderSlug.trim() !== '' &&
            orderData // Also check if we actually have order data
        const hasCartItems = currentStep === OrderFlowStep.ORDERING &&
            cartIsHydrated &&
            orderingData?.orderItems &&
            orderingData.orderItems.length > 0
        const hasUpdateItems = currentStep === OrderFlowStep.UPDATING &&
            updateOrderIsHydrated &&
            orderItemsFromStoreToUpdate &&
            orderItemsFromStoreToUpdate.orderItems &&
            Array.isArray(orderItemsFromStoreToUpdate.orderItems) &&
            orderItemsFromStoreToUpdate.orderItems.length > 0

        // ✅ Priority 1: Payment data (đang ở PAYMENT step và có paymentData)
        if (hasPaymentData) {
            return 'payment'
        }

        // ✅ Priority 2: Update order data (đang ở UPDATING step)
        if (hasUpdateItems) {
            return 'updateOrderStore'
        }

        // ✅ Priority 3: Cart data (đang ở ORDERING step)
        if (hasCartItems) {
            return 'cart'
        }

        // ✅ Fallback: Order data from API (only if we have valid data)
        if (orderData) {
            return 'orderData'
        }

        // ✅ No data available
        return 'none'
    }

    const dataSource = determineDataSource()

    // Check if we're in payment flow but order data is still loading
    const isPaymentFlowLoading = dataSource === 'payment' && isOrderLoading

    // Only show QR code when using payment or orderData as data source
    const rawQrCode =
        dataSource === 'payment' ? (paymentQrCode || paymentData?.qrCode || orderData?.payment?.qrCode || '') :
            dataSource === 'orderData' ? (orderData?.payment?.qrCode || '') : ''

    const currentOrderItems =
        dataSource === 'payment' ? orderItems :
            dataSource === 'cart' ? orderingData?.orderItems :
                dataSource === 'updateOrderStore' ? orderItemsFromStoreToUpdate?.orderItems :
                    dataSource === 'orderData' ? orderItems : []

    const currentVoucher =
        dataSource === 'payment' ? (paymentData?.orderData?.voucher || orderData?.voucher || null) :
            dataSource === 'cart' ? (orderingData?.voucher || null) :
                dataSource === 'updateOrderStore' ? (orderItemsFromStoreToUpdate?.voucher || null) :
                    dataSource === 'orderData' ? (orderData?.voucher || null) : null

    const currentOwner =
        dataSource === 'payment' ? (paymentData?.orderData?.owner || orderData?.owner) :
            dataSource === 'cart' ? (orderingData ? {
                firstName: orderingData.ownerFullName?.split(' ')[0] || '',
                lastName: orderingData.ownerFullName?.split(' ').slice(1).join(' ') || '',
                phonenumber: orderingData.ownerPhoneNumber || ''
            } : null) :
                dataSource === 'updateOrderStore' ? (orderItemsFromStoreToUpdate ? {
                    firstName: orderItemsFromStoreToUpdate.ownerFullName?.split(' ')[0] || '',
                    lastName: orderItemsFromStoreToUpdate.ownerFullName?.split(' ').slice(1).join(' ') || '',
                    phonenumber: orderItemsFromStoreToUpdate.ownerPhoneNumber || ''
                } : null) :
                    dataSource === 'orderData' ? orderData?.owner : null

    const currentType =
        dataSource === 'payment' ? (paymentData?.orderData?.type || orderData?.type) :
            dataSource === 'cart' ? orderingData?.type :
                dataSource === 'updateOrderStore' ? orderItemsFromStoreToUpdate?.type :
                    dataSource === 'orderData' ? orderData?.type : null

    const currentTable =
        dataSource === 'payment' ? (paymentData?.orderData?.table || orderData?.table) :
            dataSource === 'cart' ? (orderingData ? { name: orderingData.tableName } : null) :
                dataSource === 'updateOrderStore' ? (orderItemsFromStoreToUpdate ? { name: orderItemsFromStoreToUpdate.tableName } : null) :
                    dataSource === 'orderData' ? orderData?.table : null

    const currentDescription =
        dataSource === 'payment' ? (paymentData?.orderData?.description || orderData?.description) :
            dataSource === 'cart' ? orderingData?.description :
                dataSource === 'updateOrderStore' ? orderItemsFromStoreToUpdate?.description :
                    dataSource === 'orderData' ? orderData?.description : null

    useEffect(() => {
        if (isExpired) {
            setIsPolling(false)

            // ✅ Clear Order Flow Store updating data khi hết hạn
            if (currentStep === OrderFlowStep.UPDATING && updatingData) {
                clearUpdatingData()
            }
        }
    }, [isExpired, currentStep, updatingData, clearUpdatingData])

    // Show order success when order status is PAID
    useEffect(() => {
        if (orderData?.status === OrderStatus.PAID && !showOrderSuccess) {
            setShowOrderSuccess(true)

            // Auto hide after 5 seconds
            const timer = setTimeout(() => {
                setShowOrderSuccess(false)
            }, 5000)

            return () => clearTimeout(timer)
        }
    }, [orderData?.status, showOrderSuccess])

    // Start polling when QR code exists and payment is valid, or when payment method is selected
    useEffect(() => {
        if (!isExpired && paymentMethod === PaymentMethod.BANK_TRANSFER) {
            if (orderData?.payment?.amount != null &&
                orderData.payment.amount === orderData.subtotal &&
                rawQrCode && rawQrCode.trim() !== '') {
                // Case 1: Valid QR code - check if payment is completed
                if (orderData.payment.statusMessage === paymentStatus.COMPLETED) {
                    setIsPolling(false)
                } else {
                    setIsPolling(true)
                }
            } else if (orderData?.payment && orderData.payment.amount !== orderData.subtotal) {
                // Case 2: Payment exists but amount doesn't match - start polling for status updates
                setIsPolling(true)
            } else if (orderData?.payment && !rawQrCode && orderData.payment.amount === orderData.subtotal) {
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
    }, [isExpired, orderData, paymentMethod, rawQrCode])

    //polling order status every 3 seconds
    useEffect(() => {
        let pollingInterval: NodeJS.Timeout | null = null

        if (isPolling) {
            pollingInterval = setInterval(async () => {
                const updatedOrder = await refetchOrder()
                const orderStatus = updatedOrder.data?.result?.status
                if (orderStatus === OrderStatus.PAID) {
                    if (pollingInterval) clearInterval(pollingInterval)
                    // Always ensure loading is false before navigating
                    setIsLoading(false)
                    navigate(`${ROUTE.ORDER_SUCCESS}/${orderSlug}`)
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
    }, [isPolling, refetchOrder, navigate, orderSlug])

    // Listen to storage changes for syncing Zustand persisted state
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {

            if (e.key === "cart-store") {
                useCartItemStore.persist.rehydrate()
            }
            if (e.key === "payment-storage") {
                usePaymentMethodStore.persist.rehydrate()
            }
            // Note: update-order-store is now part of order-flow-store
            if (e.key === "order-flow-store") {
                useOrderFlowStore.persist.rehydrate()
            }
        }

        // Listen to storage events on all routes containing 'customer-display'
        if (window.location.pathname.includes('customer-display')) {
            window.addEventListener("storage", handleStorage)
        }

        return () => {
            window.removeEventListener("storage", handleStorage)
        }
    }, [])

    // Tính toán displayItems và cartTotals dựa trên dataSource đã xác định
    const displayItems: (IDisplayCartItem | IDisplayOrderItem)[] | null = (() => {
        switch (dataSource) {
            case 'payment': {
                // ✅ Ưu tiên lấy từ paymentData.orderData, fallback về API orderItems
                const paymentOrderItems = paymentData?.orderData?.orderItems || orderItems
                return paymentOrderItems.length > 0 ? calculateOrderItemDisplay(paymentOrderItems, currentVoucher) : null
            }
            case 'cart':
                return orderingData ? calculateCartItemDisplay(orderingData, currentVoucher) : null
            case 'updateOrderStore':
                // Sử dụng calculateOrderItemDisplay thay vì calculateCartItemDisplay để đảm bảo consistency với update order page
                return orderItemsFromStoreToUpdate ? calculateOrderItemDisplay(transformedOrderItems, currentVoucher) : null
            case 'orderData':
                return orderItems.length > 0 ? calculateOrderItemDisplay(orderItems, currentVoucher) : null
            case 'none':
            default:
                return null
        }
    })()

    const cartTotals = (() => {
        if (!displayItems) return null

        switch (dataSource) {
            case 'payment':
            case 'orderData':
                return calculatePlacedOrderTotals(displayItems as IDisplayOrderItem[], currentVoucher)
            case 'cart':
                return calculateCartTotals(displayItems as IDisplayCartItem[], currentVoucher)
            case 'updateOrderStore':
                // Sử dụng calculatePlacedOrderTotals vì đã dùng calculateOrderItemDisplay
                return calculatePlacedOrderTotals(displayItems as IDisplayOrderItem[], currentVoucher)
            case 'none':
            default:
                return null
        }
    })()

    // Validate QR code - must be after cartTotals calculation
    // QR code chỉ hợp lệ khi payment amount = order total (tức là chưa bị thay đổi giá trị)
    let hasValidPaymentAndQr = false

    if (dataSource === 'payment') {
        // Validate for payment source using paymentData or fallback to orderData
        const paymentAmount = paymentData?.orderData?.payment?.amount || orderData?.payment?.amount
        const subtotal = paymentData?.orderData?.subtotal || orderData?.subtotal
        hasValidPaymentAndQr = paymentAmount != null &&
            subtotal != null &&
            paymentAmount === subtotal &&
            !!(rawQrCode && rawQrCode.trim() !== '')
    } else if (dataSource === 'orderData') {
        // Validate for orderData sources using order subtotal
        hasValidPaymentAndQr = orderData?.payment?.amount != null &&
            orderData?.subtotal != null &&
            orderData.payment.amount === orderData.subtotal &&
            !!(rawQrCode && rawQrCode.trim() !== '')
    } else if (dataSource === 'updateOrderStore') {
        // For updateOrderStore, validate against calculated total from store
        const calculatedTotal = cartTotals?.finalTotal || 0
        hasValidPaymentAndQr = orderData?.payment?.amount != null &&
            calculatedTotal > 0 &&
            orderData.payment.amount === calculatedTotal &&
            !!(rawQrCode && rawQrCode.trim() !== '')
    } else {
        // For 'cart', 'none', or other cases, no QR validation
        hasValidPaymentAndQr = false
    }

    // Only display QR code if validation passes and payment method is not cash
    const qrCode = hasValidPaymentAndQr && paymentMethod !== PaymentMethod.CASH ? rawQrCode : ''

    const renderPaymentSummary = () => {
        return (
            <div className="sticky top-4 space-y-4">
                {/* QR Code Section - Only show if QR exists */}
                {(qrCode || orderSlug) && (
                    <div className="overflow-hidden relative bg-white rounded-2xl border-2 shadow-lg border-primary/20 dark:bg-gray-900">
                        {/* Header */}
                        <div className="p-3 text-center bg-gradient-to-r from-primary/10 to-primary/5">
                            <div className="flex gap-2 justify-center items-center mb-1">
                                <QrCode className="w-5 h-5 text-primary" />
                                <h3 className="text-lg font-bold text-primary">{t("paymentMethod.scanToPay")}</h3>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className="p-4">
                            <div className="overflow-hidden relative mx-auto bg-white rounded-xl w-fit dark:bg-transparent">
                                <img src={qrCode} alt="QR Code" className="w-full h-auto max-w-[240px] mx-auto" />
                                <div className="absolute inset-0 rounded-xl border-2 border-dashed border-primary/30"></div>
                            </div>
                        </div>

                        {/* Countdown */}
                        <div className="p-3 bg-gray-50 dark:bg-gray-800">
                            <CustomerDisplayCountdown
                                createdAt={orderData?.createdAt || timeDefaultExpired}
                                setIsExpired={handleExpire}
                            />
                        </div>

                        {/* Status Indicator */}
                        <div className="flex gap-2 justify-center items-center p-2 bg-amber-50 dark:bg-amber-900/20">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                                {t("order.waitingForPayment")}
                            </span>
                        </div>
                    </div>
                )}

                {/* Order Summary - Always show */}
                <div className="overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-700">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800">
                        <div className="space-y-2 text-sm">
                            {/* Subtotal */}
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">{t('order.subtotalBeforeDiscount')}</span>
                                <span className="font-medium">{formatCurrency(cartTotals?.subTotalBeforeDiscount || 0)}</span>
                            </div>

                            {/* Promotion Discount */}
                            {cartTotals && cartTotals?.promotionDiscount > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-orange-600 dark:text-orange-400">{t('order.promotionDiscount')}</span>
                                    <span className="font-medium text-orange-600 dark:text-orange-400">-{formatCurrency(cartTotals?.promotionDiscount || 0)}</span>
                                </div>
                            )}

                            {/* Voucher Discount */}
                            {cartTotals && cartTotals?.voucherDiscount > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-green-600 dark:text-green-400">{t('order.voucherDiscount')}</span>
                                    <span className="font-medium text-green-600 dark:text-green-400">-{formatCurrency(cartTotals?.voucherDiscount || 0)}</span>
                                </div>
                            )}

                            <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{t('order.totalPayment')}</span>
                                    <span className="text-2xl font-bold text-primary">
                                        {formatCurrency(cartTotals?.finalTotal || 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const handleExpire = useCallback((value: boolean) => {
        setIsExpired(value)
    }, [])

    // Show order success overlay
    if (showOrderSuccess) {
        return (
            <div className="flex flex-col gap-4 justify-center items-center w-full h-screen">
                <img src={OrderSuccess} className="w-48 h-48 sm:object-fill" />
                <div className='text-xl font-semibold text-primary'>{t('order.orderSuccess')}</div>
            </div>
        )
    }

    // Show simple logo when no data at all
    const hasAnyData = (currentOrderItems && currentOrderItems.length > 0) || currentOwner || currentTable || currentDescription || qrCode

    if (!hasAnyData && !isPaymentFlowLoading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen">
                <img src={Logo} className="w-48" />
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <div className="container px-3 py-4 mx-auto max-w-7xl min-h-80">
                <div className="grid gap-2 lg:grid-cols-3">
                    {/* Left: Order Details */}
                    <div className="space-y-2 lg:col-span-2">
                        {/* Customer Information Card - Only show if customer info exists */}
                        {(currentOwner || currentType || currentTable || currentDescription) && (
                            <div className="p-2 bg-white rounded-xl border border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-700">
                                <div className="flex gap-2 items-center mb-3">
                                    <div className="p-1.5 rounded-lg bg-primary/10">
                                        <User className="w-4 h-4 text-primary" />
                                    </div>
                                    <h2 className="font-semibold text-md">{t("menu.customerInformation")}</h2>
                                </div>

                                <div className="grid gap-3 text-sm sm:grid-cols-2">
                                    {currentOwner && currentOwner.firstName && (
                                        <div className="flex gap-2 items-start">
                                            <User className="w-3 h-3 text-muted-foreground" />
                                            <div>
                                                <div className="text-xs text-muted-foreground">{t("menu.customerName")}</div>
                                                <div className="font-medium">{currentOwner?.firstName} {currentOwner?.lastName}</div>
                                            </div>
                                        </div>
                                    )}

                                    {currentOwner && currentOwner.phonenumber && (
                                        <div className="flex gap-2 items-start">
                                            <Phone className="w-3 h-3 text-muted-foreground" />
                                            <div>
                                                <div className="text-xs text-muted-foreground">{t("order.phoneNumber")}</div>
                                                <div className="font-medium">{currentOwner?.phonenumber}</div>
                                            </div>
                                        </div>
                                    )}

                                    {currentType && (
                                        <div className="flex gap-2 items-start">
                                            <MapPin className="w-3 h-3 text-muted-foreground" />
                                            <div>
                                                <div className="text-xs text-muted-foreground">{t("menu.orderType")}</div>
                                                <div className="flex gap-2 items-center">
                                                    <span className="text-sm font-medium">
                                                        {currentType === OrderTypeEnum.AT_TABLE ? t("menu.dineIn") : t("menu.takeAway")}
                                                    </span>
                                                    {currentTable && currentTable.name && (
                                                        <Badge className="px-1 py-0 text-xs">
                                                            {t("menu.tableNumber")} {currentTable?.name}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {currentDescription && (
                                        <div className="flex gap-2 items-start sm:col-span-2">
                                            <FileText className="mt-1 w-3 h-3 text-muted-foreground" />
                                            <div>
                                                <div className="text-xs text-muted-foreground">{t("menu.description")}</div>
                                                <div className="font-medium">{currentDescription}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Order Items Card - Compact Grid Layout */}
                        <div className="overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-700">
                            <div className="p-2 border-b border-gray-200 bg-primary/10 dark:border-gray-70 dark:bg-transparent0">
                                <h2 className="text-sm font-semibold">{t("order.orderItems")}</h2>
                            </div>

                            {/* Compact Items Display */}
                            <div className="overflow-y-auto">
                                <div className="p-2">
                                    {isPaymentFlowLoading ? (
                                        <div className="flex flex-col items-center justify-center min-h-[12rem] gap-2 text-muted-foreground">
                                            <div className="w-8 h-8 rounded-full border-b-2 animate-spin border-primary"></div>
                                            <div className="text-center">
                                                <p className="font-medium">Đang tải dữ liệu đơn hàng...</p>
                                            </div>
                                        </div>
                                    ) : !currentOrderItems || currentOrderItems.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
                                            <img src={OrderSuccess} className="w-32 h-32 opacity-20" />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-x-3">
                                            {currentOrderItems.map((item: IOrderItem | IOrderDetail, index: number) => {
                                                // Extract data based on different item structures
                                                let productName = ''
                                                // let productSize = ''
                                                let originalPrice = 0
                                                let itemSlug = ''
                                                let itemNote = ''
                                                let itemQuantity = 1

                                                if (dataSource === 'cart') {
                                                    // IOrderItem structure from Order Flow Store
                                                    const cartItem = item as IOrderItem
                                                    productName = cartItem.name || ''
                                                    // productSize = typeof cartItem.size === 'string' ? cartItem.size : (cartItem.size as ISize)?.name || ''
                                                    originalPrice = cartItem.originalPrice || 0
                                                    itemSlug = cartItem.slug || ''
                                                    itemNote = cartItem.note || ''
                                                    itemQuantity = cartItem.quantity || 1
                                                } else if (dataSource === 'updateOrderStore') {
                                                    // From update order store
                                                    const updateItem = item as IOrderItem
                                                    productName = updateItem.name || ''
                                                    // productSize = typeof updateItem.size === 'string' ? updateItem.size : (updateItem.size as ISize)?.name || ''
                                                    originalPrice = updateItem.originalPrice || 0
                                                    itemSlug = updateItem.productSlug || ''
                                                    itemNote = updateItem.note || ''
                                                    itemQuantity = updateItem.quantity || 1
                                                } else {
                                                    // IOrderDetail structure from API (payment/orderData)
                                                    const orderDetail = item as IOrderDetail
                                                    productName = orderDetail?.variant?.product?.name || ''
                                                    // productSize = orderDetail?.variant?.size?.name || ''
                                                    originalPrice = orderDetail?.variant?.price || 0
                                                    itemSlug = orderDetail?.variant?.product?.slug || ''
                                                    itemNote = orderDetail?.note || ''
                                                    itemQuantity = orderDetail?.quantity || 1
                                                }

                                                const displayItem = displayItems?.find((di: IDisplayCartItem | IDisplayOrderItem) => {
                                                    let displaySlug = ''

                                                    if (dataSource === 'updateOrderStore') {
                                                        displaySlug = (di as IDisplayOrderItem).productSlug
                                                    } else if (dataSource === 'cart') {
                                                        displaySlug = (di as IDisplayCartItem).slug
                                                    } else {
                                                        displaySlug = 'productSlug' in di ? di.productSlug : di.slug
                                                    }

                                                    return displaySlug === itemSlug
                                                })

                                                const priceAfterPromotion = displayItem?.priceAfterPromotion || 0
                                                const finalPrice = displayItem?.finalPrice || 0

                                                const isSamePriceVoucher =
                                                    currentVoucher?.type === VOUCHER_TYPE.SAME_PRICE_PRODUCT &&
                                                    currentVoucher?.voucherProducts?.some((vp) => {
                                                        const voucherProductSlug = vp?.product?.slug
                                                        return voucherProductSlug && itemSlug && voucherProductSlug === itemSlug
                                                    })

                                                const hasPromotionDiscount = (displayItem?.promotionDiscount || 0) > 0

                                                const displayPrice = isSamePriceVoucher
                                                    ? finalPrice
                                                    : hasPromotionDiscount
                                                        ? priceAfterPromotion
                                                        : originalPrice

                                                // const shouldShowLineThrough = isSamePriceVoucher || hasPromotionDiscount

                                                return (
                                                    <div key={item.id || index} className={`py-2 px-0.5 border-b border-dashed border-gray-300 min-h-[32px] ${index % 2 === 0 ? 'bg-gray-50/30' : ''} dark:border-gray-600`}>
                                                        {/* Grid layout: Product info + Unit price | Quantity | Total price */}
                                                        <div className="grid grid-cols-8 gap-3 items-start">
                                                            {/* Column 1: Product Name + Note + Size + Unit Price */}
                                                            <div className="flex flex-col gap-1.5 min-w-0 col-span-5">
                                                                <div className="flex flex-wrap gap-2 items-center w-full text-sm font-bold leading-tight truncate dark:text-gray-100">
                                                                    <span className="truncate">{productName}</span>
                                                                </div>
                                                                {itemNote && (
                                                                    <div className="text-sm leading-tight text-muted-foreground dark:text-gray-400">
                                                                        {itemNote}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Column 2: Price */}
                                                            <div className="col-span-1 flex justify-center pt-0.5">
                                                                <Badge variant='outline' className='text-xs w-fit border-muted-foreground/50 text-muted-foreground'>
                                                                    {formatCurrency(displayPrice)}
                                                                    {/* {shouldShowLineThrough && originalPrice !== displayPrice ? (
                                                                            <>
                                                                                <span className="mr-1 line-through text-muted-foreground">
                                                                                    {formatCurrency(originalPrice)}
                                                                                </span>
                                                                                {formatCurrency(displayPrice)}
                                                                            </>
                                                                        ) : (
                                                                            formatCurrency(displayPrice)
                                                                        )} */}
                                                                </Badge>
                                                            </div>

                                                            {/* Column 3: Quantity */}
                                                            <div className="col-span-1 flex justify-center pt-0.5">
                                                                <Badge className='text-xs w-fit'>
                                                                    x{itemQuantity}
                                                                </Badge>
                                                            </div>

                                                            {/* Column 4: Total Price (Unit Price * Quantity) */}
                                                            <div className="col-span-1 flex flex-shrink-0 justify-end pt-0.5">
                                                                <div className="text-right">
                                                                    <div className="leading-none text-md text-primary">
                                                                        {formatCurrency(displayPrice * itemQuantity)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: QR Code & Summary */}
                    <div className="lg:col-span-1">
                        {renderPaymentSummary()}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-700">
                        <div className="mb-1 text-base font-medium text-primary">
                            {t('order.thankYouForOrdering')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
