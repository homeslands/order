import { useCallback, useEffect, useState } from 'react'
import _ from 'lodash'
import { NavLink, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import {
    ShoppingCartIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { ROUTE } from '@/constants'
import { Button } from '@/components/ui'
import { useIsMobile, useOrderBySlug } from '@/hooks'
import { OrderTypeEnum, OrderStatus } from '@/types'
import { SystemMenuInUpdateOrderTabs } from '@/components/app/tabs'
import { OrderCountdown } from '@/components/app/countdown'
import { useOrderFlowStore } from '@/stores'
import { UpdateOrderContent } from './components'

export default function UpdateOrderPage() {
    const { t } = useTranslation('menu')
    const { t: tHelmet } = useTranslation('helmet')
    const isMobile = useIsMobile()
    const { slug } = useParams()
    const { data: order, refetch: refetchOrder } = useOrderBySlug(slug)
    const [isExpired, setIsExpired] = useState<boolean>(false)
    const [isPolling, setIsPolling] = useState<boolean>(false)
    const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false) // Track if data is loaded to store
    const {
        updatingData,
        initializeUpdating,
        clearUpdatingData,
    } = useOrderFlowStore()

    useEffect(() => {
        if (order?.result && order.result.orderItems && !isDataLoaded) {
            // Đảm bảo order data đầy đủ trước khi initialize
            const orderData = order.result

            // Validate order data có đầy đủ không
            if (!orderData.slug || !orderData.orderItems || orderData.orderItems.length === 0) {
                return
            }

            // ✅ Force initialize updating phase với original order (không check currentStep)
            try {
                initializeUpdating(orderData)
                setIsDataLoaded(true) // Mark data as loaded
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('❌ Update Order: Failed to initialize updating data:', error)
            }
        }
    }, [order, isDataLoaded, initializeUpdating])

    // Separate useEffect for polling control
    useEffect(() => {
        if (order?.result && isDataLoaded) {
            const orderData = order.result
            // Start/stop polling based on order status
            if (orderData.status === OrderStatus.PENDING && !isExpired) {
                setIsPolling(true)
            } else {
                setIsPolling(false)
            }
        }
    }, [order, isDataLoaded, isExpired])

    // Reset store when slug changes (navigating to different order)
    useEffect(() => {
        if (slug) {
            // Check if current updating data matches the slug
            const isDataMismatch = updatingData?.originalOrder?.slug &&
                updatingData.originalOrder.slug !== slug

            if (isDataMismatch || !updatingData) {
                clearUpdatingData()
                setIsDataLoaded(false) // Reset data loaded flag for new order
            }
        }
    }, [slug, updatingData, clearUpdatingData])

    // Get current order data from Order Flow Store for updates
    const currentOrder = updatingData?.updateDraft
    const orderType = currentOrder?.type as OrderTypeEnum
    const table = currentOrder?.table || ""

    // Fallback initialization nếu data không được load vào store sau 2 giây
    useEffect(() => {
        if (order?.result && isDataLoaded && !updatingData && slug) {
            const timeoutId = setTimeout(() => {
                try {
                    initializeUpdating(order.result)
                } catch (error) {
                    // eslint-disable-next-line no-console
                    console.error('❌ Update Order: Retry initialization failed:', error)
                }
            }, 2000)

            return () => clearTimeout(timeoutId)
        }
    }, [order, isDataLoaded, updatingData, slug, initializeUpdating])

    // Polling for order status changes every 5 seconds
    useEffect(() => {
        let pollingInterval: NodeJS.Timeout | null = null

        if (isPolling && !isExpired) {
            pollingInterval = setInterval(async () => {
                const updatedOrder = await refetchOrder()
                const orderData = updatedOrder.data?.result

                if (orderData) {
                    // Stop polling if order status changed from PENDING
                    if (orderData.status !== OrderStatus.PENDING) {
                        setIsPolling(false)

                        // Show notification to user about status change
                        // TODO: Add toast notification here
                        // showToast('Order status has changed. Please refresh the page.')
                    }
                }
            }, 5000) // Poll every 5 seconds
        }

        return () => {
            if (pollingInterval) {
                clearInterval(pollingInterval)
            }
        }
    }, [isPolling, isExpired, refetchOrder])

    // Stop polling when page expires
    useEffect(() => {
        if (isExpired) {
            setIsPolling(false)
        }
    }, [isExpired])

    const handleExpire = useCallback((value: boolean) => {
        setIsExpired(value)
        if (value) {
            setIsPolling(false)

            // ✅ Clear updating data khi đơn hết hạn
            clearUpdatingData()
            setIsDataLoaded(false)
        }
    }, [clearUpdatingData])

    if (isExpired) {
        return (
            <div className="container py-20 lg:h-[60vh]">
                <div className="flex flex-col items-center justify-center gap-5">
                    <ShoppingCartIcon className="w-32 h-32 text-primary" />
                    <p className="text-center text-[13px] sm:text-base">
                        {t('order.noOrders')}
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

    return (
        <div className='pb-4'>
            <Helmet>
                <meta charSet='utf-8' />
                <title>
                    {tHelmet('helmet.updateOrder.title')}
                </title>
                <meta name='description' content={tHelmet('helmet.updateOrder.title')} />
            </Helmet>
            {order?.result?.createdAt && (
                <OrderCountdown
                    createdAt={order.result.createdAt}
                    setIsExpired={handleExpire}
                />
            )}

            {/* Order type selection */}
            {order?.result &&
                <div className={`flex gap-4 ${isMobile ? 'flex-col' : 'flex-row'}`}>
                    {/* Mobile: Content first (top), Desktop: Menu first (left) */}
                    {isMobile ? (
                        <>
                            {/* Content trên mobile */}
                            <div className="w-full">
                                <UpdateOrderContent
                                    orderType={orderType}
                                    table={table}
                                />
                            </div>

                            {/* Menu dưới mobile */}
                            <div className="flex flex-col w-full gap-2 py-3">
                                {/* Menu & Table select */}
                                <div className="min-h-[50vh]">
                                    <SystemMenuInUpdateOrderTabs type={orderType} order={order.result} />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className='flex flex-col w-full h-screen'>
                            {/* Desktop layout - Menu left */}
                            <div className={`flex ${isMobile ? 'w-full' : 'w-[75%] xl:w-[70%] pr-6 xl:pr-0'} flex-col gap-2`}>
                                {/* Menu & Table select */}
                                <SystemMenuInUpdateOrderTabs type={orderType} order={order.result} />
                            </div>

                            {/* Desktop layout - Content right */}
                            <UpdateOrderContent
                                orderType={orderType}
                                table={table}
                            />
                        </div>
                    )}
                </div>
            }
        </div>
    )
}
