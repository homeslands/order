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
import { OrderStatus, OrderTypeEnum } from '@/types'
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
    const [isPolling, setIsPolling] = useState<boolean>(false)
    const [isExpired, setIsExpired] = useState<boolean>(false)
    const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false) // Track if data is loaded to store
    const [shouldReinitialize, setShouldReinitialize] = useState<boolean>(false)
    const [isRefetching] = useState<boolean>(false)
    const {
        updatingData,
        initializeUpdating,
        clearUpdatingData,
        setDraftTable,
        setDraftType,
        addDraftPickupTime,
        setDraftDescription,
        setDraftVoucher,
        updateDraftItem
    } = useOrderFlowStore()

    // Initialize updating data
    useEffect(() => {
        if (order?.result && order.result.orderItems && (!isDataLoaded || shouldReinitialize) && !isRefetching) {
            // Đảm bảo order data đầy đủ trước khi initialize
            const orderData = order.result

            // Validate order data có đầy đủ không
            if (!orderData.slug || !orderData.orderItems || orderData.orderItems.length === 0) {
                return
            }
            // 
            if (shouldReinitialize) {
                // ✅ Preserve current draft values before reinitializing
                const currentDraft = updatingData?.updateDraft
                const preservedTimeLeftTakeOut = currentDraft?.timeLeftTakeOut
                const preservedType = currentDraft?.type || orderData.type
                const preservedDescription = currentDraft?.description || orderData.description
                const preservedVoucher = currentDraft?.voucher || orderData.voucher

                // ✅ Preserve non-optimistic item changes (quantity, notes)
                const preservedItemChanges = currentDraft?.orderItems?.reduce((acc, draftItem) => {
                    // Chỉ preserve changes cho items có slug thật (không phải optimistic)
                    if (draftItem.slug && draftItem.slug !== draftItem.productSlug) {
                        const originalItem = orderData.orderItems.find(oi => oi.slug === draftItem.slug)
                        if (originalItem) {
                            // Preserve nếu có thay đổi quantity hoặc note
                            if (draftItem.quantity !== originalItem.quantity || draftItem.note !== (originalItem.note || '')) {
                                acc[draftItem.slug] = {
                                    quantity: draftItem.quantity,
                                    note: draftItem.note || ''
                                }
                            }
                        }
                    }
                    return acc
                }, {} as Record<string, { quantity: number; note: string }>)

                // ✅ Update order data with current draft table and name if available
                const exampleTable = {
                    ...orderData.table,
                    type: preservedType as OrderTypeEnum,
                    slug: preservedType === OrderTypeEnum.AT_TABLE ? currentDraft?.table || orderData.table?.slug || '' : orderData.table?.slug || '',
                    name: preservedType === OrderTypeEnum.AT_TABLE ? currentDraft?.tableName || orderData.table?.name || '' : orderData.table?.name || '',
                }

                // ✅ Reinitialize với data mới từ server (bao gồm món vừa add)
                initializeUpdating(orderData)
                // console.log('✅ Initialized with', orderData.orderItems.length, 'items from server')

                // ✅ Restore preserved values after initialization
                if (preservedType && preservedType !== orderData.type) {
                    setDraftType(preservedType as OrderTypeEnum)
                }
                if (preservedTimeLeftTakeOut !== undefined && preservedType === OrderTypeEnum.TAKE_OUT) {
                    addDraftPickupTime(preservedTimeLeftTakeOut)
                }
                if (preservedDescription !== orderData.description) {
                    setDraftDescription(preservedDescription || '')
                }
                if (preservedVoucher?.slug !== orderData.voucher?.slug) {
                    setDraftVoucher(preservedVoucher)
                }

                // ✅ Restore preserved item changes (với delay để đảm bảo store đã update)
                setTimeout(() => {
                    const currentUpdatingData = useOrderFlowStore.getState().updatingData
                    Object.entries(preservedItemChanges || {}).forEach(([itemSlug, changes]) => {
                        const itemId = currentUpdatingData?.updateDraft?.orderItems?.find(item => item.slug === itemSlug)?.id
                        if (itemId) {
                            updateDraftItem(itemId, changes)
                        }
                    })
                }, 100)

                setDraftTable(exampleTable) // Set updated table in store
                setShouldReinitialize(false)
            } else {
                // ✅ Force initialize updating phase với original order (không check currentStep)
                try {
                    initializeUpdating(orderData)
                    setIsDataLoaded(true) // Mark data as loaded
                } catch (error) {
                    // eslint-disable-next-line no-console
                    console.error('❌ Update Order: Failed to initialize updating data:', error)
                }
            }


        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [order, isDataLoaded, shouldReinitialize, isRefetching, initializeUpdating])

    // Separate useEffect for polling control (currently disabled)
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

    // Stop polling when page expires (currently disabled)
    useEffect(() => {
        if (isExpired) {
            setIsPolling(false)
        }
    }, [isExpired])

    const handleExpire = useCallback((value: boolean) => {
        setIsExpired(value)
        if (value) {
            // ✅ Clear updating data khi đơn hết hạn
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

    if (isExpired) {
        return (
            <div className="container py-20 lg:h-[60vh]">
                <div className="flex flex-col gap-5 justify-center items-center">
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
                            <div className="flex flex-col gap-2 py-3 w-full">
                                {/* Menu & Table select */}
                                <div className="min-h-[50vh]">
                                    <SystemMenuInUpdateOrderTabs type={orderType} order={order.result} onSubmit={() => _handleRefetchAndReinitialize()} />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className='flex flex-col w-full h-screen'>
                            {/* Desktop layout - Menu left */}
                            <div className={`flex ${isMobile ? 'w-full' : 'w-[75%] xl:w-[70%] pr-6 xl:pr-0'} flex-col gap-2`}>
                                {/* Menu & Table select */}
                                <SystemMenuInUpdateOrderTabs type={orderType} order={order.result} onSubmit={() => _handleRefetchAndReinitialize()} />
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
