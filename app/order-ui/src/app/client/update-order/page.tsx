import { useCallback, useEffect, useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import {
    CircleAlert,
    ShoppingCartIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
} from '@/components/app/dialog'
import { ROUTE } from '@/constants'
import { Button, ScrollArea } from '@/components/ui'
import { useIsMobile, useOrderBySlug } from '@/hooks'
import UpdateOrderSkeleton from '../skeleton/page'
import { OrderStatus, OrderTypeEnum } from '@/types'
import { OrderCountdown } from '@/components/app/countdown'
import { useOrderFlowStore } from '@/stores'
import ClientUpdateOrderContent from './components/client-update-order-content'
import { ClientMenuTabs } from '@/components/app/tabs'

export default function ClientUpdateOrderPage() {
    const isMobile = useIsMobile()
    const { t } = useTranslation('menu')
    const { t: tHelmet } = useTranslation('helmet')
    const { slug } = useParams()
    const { data: order, isPending, refetch: refetchOrder } = useOrderBySlug(slug)
    const [isExpired, setIsExpired] = useState<boolean>(false)
    const [_isPolling, setIsPolling] = useState<boolean>(false)
    const [shouldReinitialize, setShouldReinitialize] = useState<boolean>(false)
    const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false) // Track if data is loaded to store
    const {
        updatingData,
        initializeUpdating,
        clearUpdatingData,
    } = useOrderFlowStore()

    // Simple data initialization - only when order changes
    useEffect(() => {
        if (!order?.result || !slug) return

        const orderData = order.result
        const isValidOrder = orderData.slug && orderData.orderItems && orderData.orderItems.length > 0

        if (isValidOrder && !isDataLoaded) {
            try {
                initializeUpdating(orderData)
                setIsDataLoaded(true)
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('❌ Update Order: Failed to initialize updating data:', error)
            }
        }
    }, [order?.result, slug, isDataLoaded, initializeUpdating])

    // Handle reinitialize flag
    useEffect(() => {
        if (shouldReinitialize && order?.result) {
            try {
                initializeUpdating(order.result)
                setIsDataLoaded(true)
                setShouldReinitialize(false)
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('❌ Update Order: Reinitialize failed:', error)
            }
        }
    }, [shouldReinitialize, order?.result, initializeUpdating])

    // Get current order data from Order Flow Store for updates
    const _currentOrder = updatingData?.updateDraft
    const _orderType = _currentOrder?.type as OrderTypeEnum || order?.result?.type as OrderTypeEnum || OrderTypeEnum.AT_TABLE
    const _table = _currentOrder?.table || order?.result?.table?.slug || ""

    // Simple polling - only when order is pending
    useEffect(() => {
        if (!order?.result || !isDataLoaded || isExpired) return

        const orderData = order.result
        const shouldPoll = orderData.status === OrderStatus.PENDING

        if (!shouldPoll) {
            setIsPolling(false)
            return
        }

        setIsPolling(true)

        const pollingInterval = setInterval(async () => {
            try {
                const updatedOrder = await refetchOrder()
                const orderData = updatedOrder.data?.result

                if (orderData && orderData.status !== OrderStatus.PENDING) {
                    setIsPolling(false)
                    // TODO: Add toast notification here
                    // showToast('Order status has changed. Please refresh the page.')
                }
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('❌ Update Order: Polling failed:', error)
            }
        }, 5000)

        return () => clearInterval(pollingInterval)
    }, [order?.result, isDataLoaded, isExpired, refetchOrder])

    const handleExpire = useCallback((value: boolean) => {
        setIsExpired(value)
        if (value) {
            setIsPolling(false)
            clearUpdatingData()
            setIsDataLoaded(false)
        }
    }, [clearUpdatingData])

    const _handleRefetchAndReinitialize = useCallback(async () => {
        try {
            await refetchOrder()
            setShouldReinitialize(true)
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('❌ Update Order: Failed to refetch and reinitialize:', error)
        }
    }, [refetchOrder])

    if (isPending) { return <UpdateOrderSkeleton /> }

    if (isExpired) {
        return (
            <div className="container py-20 lg:h-[60vh]">
                <div className="flex flex-col items-center justify-center gap-5">
                    <ShoppingCartIcon className="w-32 h-32 text-primary" />
                    <p className="text-center text-[13px] sm:text-sm">
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
        <div className={`container py-10`}>
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
                                <ClientUpdateOrderContent
                                    orderType={_orderType}
                                    table={_table}
                                />
                            </div>

                            {/* Menu dưới mobile */}
                            <div className="flex flex-col w-full gap-2 py-3">
                                {/* Note */}
                                <div className="flex items-end justify-between">
                                    <div className="flex items-center gap-1">
                                        <CircleAlert size={14} className="text-destructive" />
                                        <span className="text-xs italic text-destructive">
                                            {t('order.selectTableNote')}
                                        </span>
                                    </div>
                                </div>

                                {/* Menu & Table select */}
                                <div className="min-h-[50vh]">
                                    <ClientMenuTabs onSuccess={_handleRefetchAndReinitialize} />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Desktop layout - Menu left */}
                            <div className="flex w-[70%] pr-6 xl:pr-0 flex-col gap-2 py-3">
                                {/* Note */}
                                <div className="flex items-end justify-between">
                                    <div className="flex items-center gap-1">
                                        <CircleAlert size={14} className="text-destructive" />
                                        <span className="text-xs italic text-destructive">
                                            {t('order.selectTableNote')}
                                        </span>
                                    </div>
                                </div>

                                {/* Menu & Table select */}
                                <ScrollArea className="h-[calc(100vh-9rem)]">
                                    <ClientMenuTabs onSuccess={_handleRefetchAndReinitialize} />
                                </ScrollArea>
                            </div>

                            {/* Desktop layout - Content right */}
                            <ClientUpdateOrderContent
                                orderType={_orderType}
                                table={_table}
                            />
                        </>
                    )}
                </div>
            }
        </div>
    )
}
