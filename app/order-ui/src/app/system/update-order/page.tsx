import { useCallback, useEffect, useState } from 'react'
import _ from 'lodash'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import {
    ShoppingCartIcon,
    Trash2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
    RemoveOrderItemInUpdateOrderDialog,
} from '@/components/app/dialog'
import { ROUTE, VOUCHER_TYPE } from '@/constants'
import { Button, ScrollArea } from '@/components/ui'
import { StaffVoucherListSheetInUpdateOrder } from '@/components/app/sheet'
import { useOrderBySlug, useUpdateOrderType } from '@/hooks'
// import UpdateOrderSkeleton from '@/components/app/skeleton/page'
import { OrderTypeInUpdateOrderSelect } from '@/components/app/select'
import { OrderTypeEnum } from '@/types'
import { calculateOrderItemDisplay, calculatePlacedOrderTotals, formatCurrency, showToast } from '@/utils'
import { SystemMenuInUpdateOrderTabs } from '@/components/app/tabs'
import UpdateOrderQuantity from './components/update-quantity'
import { UpdateOrderItemNoteInput, UpdateOrderNoteInput } from './components'
import { OrderCountdown } from '@/components/app/countdown/OrderCountdown'
import { useOrderTypeStore } from '@/stores'

export default function UpdateOrderPage() {
    const { t } = useTranslation('menu')
    const { t: tHelmet } = useTranslation('helmet')
    const { t: tToast } = useTranslation('toast')
    const { t: tVoucher } = useTranslation('voucher')
    const { slug } = useParams()
    const { mutate: updateOrderType } = useUpdateOrderType()
    const { data: order, refetch } = useOrderBySlug(slug as string)
    const { orderType, table, addOrderType, addTable, clearStore } = useOrderTypeStore()
    const navigate = useNavigate()
    const [isExpired, setIsExpired] = useState<boolean>(false)

    useEffect(() => {
        if (order?.result) {
            addOrderType(order?.result.type as OrderTypeEnum)
            addTable(order?.result.table?.slug || "")
        }
    }, [order, addOrderType, addTable])

    // const handleTypeChange = (value: string) => {
    //     let params: IUpdateOrderTypeRequest | null = null
    //     if (value === OrderTypeEnum.AT_TABLE && selectedTable?.slug) {
    //         params = { type: value, table: selectedTable.slug }
    //     } else {
    //         params = { type: value, table: null }
    //     }
    //     updateOrderType(
    //         { slug: slug as string, params },
    //         {
    //             onSuccess: () => {
    //                 refetch()
    //             }
    //         }
    //     )
    // }

    const orderItems = order?.result
    const voucher = orderItems?.voucher || null

    const displayItems = calculateOrderItemDisplay(orderItems ? orderItems?.orderItems : [], voucher)

    const cartTotals = calculatePlacedOrderTotals(displayItems, voucher)

    // const originalTotal = orderItems
    //     ? orderItems.orderItems.reduce((sum, item) => sum + item.variant.price * item.quantity, 0)
    //     : 0;

    // calculate subTotal after promotion
    // const subTotal = orderItems?.orderItems.reduce((acc, item) => {
    //     const price = item.variant.price;
    //     const quantity = item.quantity;
    //     const discount = item.promotion ? item.promotion.value : 0;

    //     const itemTotal = price * quantity * (1 - discount / 100);
    //     return acc + itemTotal;
    // }, 0) || 0;

    // const voucherValue = orderItems?.voucher?.type === VOUCHER_TYPE.PERCENT_ORDER
    //     ? (orderItems?.voucher?.value || 0) / 100 * subTotal
    //     : orderItems?.voucher?.value || 0


    // calculate discount base on promotion
    // const discount = orderItems?.orderItems.reduce((sum, item) => sum + (item.promotion ? item.variant.price * item.quantity * (item.promotion.value / 100) : 0), 0)
    const handleRemoveOrderItemSuccess = () => {
        refetch()
    }

    const handleUpdateOrderTypeSuccess = () => {
        showToast(tToast('toast.updateOrderSuccess'))
        refetch()
    }

    const handleUpdateOrderNoteSuccess = () => {
        refetch()
    }
    const handleExpire = useCallback((value: boolean) => {
        setIsExpired(value)
    }, [])

    const handleClickPayment = () => {
        updateOrderType({ slug: slug as string, params: { type: orderType, table: table } }, {
            onSuccess: () => {
                clearStore()
                showToast(tToast('toast.updateOrderSuccess'))
                navigate(`${ROUTE.STAFF_ORDER_PAYMENT}?order=${orderItems?.slug}`)
            }
        })
    }

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
                <div className="flex flex-col-reverse gap-4 sm:gap-0 lg:flex-row">
                    {/* Left content */}
                    <div className="w-full lg:w-3/5">
                        {/* Menu & Table select */}
                        <ScrollArea className="h-[calc(100vh-9rem)] pr-4">
                            <SystemMenuInUpdateOrderTabs type={orderType} order={order.result} onSuccess={handleUpdateOrderTypeSuccess} />
                        </ScrollArea>
                    </div>

                    {/* Right content */}
                    <div className="w-full lg:w-2/5">
                        <OrderTypeInUpdateOrderSelect typeOrder={orderType} />
                        <ScrollArea className="h-[calc(55vh)] sm:h-[calc(73vh)] sm:pr-4">
                            {/* Table list order items */}
                            <div className="mt-4">
                                <div className="grid grid-cols-7 px-4 py-3 mb-4 text-sm font-thin rounded-md border bg-muted/60">
                                    <span className="col-span-2">{t('order.product')}</span>
                                    <span className="col-span-2 text-center">
                                        {t('order.quantity')}
                                    </span>
                                    <span className="col-span-2 text-center">
                                        {t('order.grandTotal')}
                                    </span>
                                    <span className="flex col-span-1 justify-center">
                                        <Trash2 size={18} />
                                    </span>
                                </div>

                                <div className="flex flex-col rounded-md border">
                                    {orderItems?.orderItems.map((item) => (
                                        <div key={item.slug} className="grid gap-2 items-center px-4 py-2 mt-1 w-full rounded-md">
                                            <div key={`${item.slug}`} className="grid flex-row grid-cols-7 items-center w-full">
                                                <div className="flex col-span-2 gap-1 w-full">
                                                    <div className="flex flex-col gap-2 justify-start items-center sm:flex-row sm:justify-center">
                                                        <div className="flex flex-col">
                                                            <span className="text-[14px] font-bold truncate sm:text-md mb-2">
                                                                {item.variant.product.name}
                                                                <span className='font-normal uppercase'> - {item.variant.size.name}</span>
                                                            </span>
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
                                                    </div>
                                                </div>
                                                <div className="flex col-span-2 justify-center items-end h-full">
                                                    <UpdateOrderQuantity orderItem={item} onSuccess={refetch} />
                                                </div>
                                                <div className="col-span-2 h-full">
                                                    <span className="flex justify-center items-end h-full text-sm font-semibold text-primary">
                                                        {`${formatCurrency((item.subtotal || 0))}`}
                                                    </span>
                                                </div>
                                                <div className="flex col-span-1 justify-center items-end h-full" >
                                                    <RemoveOrderItemInUpdateOrderDialog onSubmit={handleRemoveOrderItemSuccess} orderItem={item} totalOrderItems={orderItems?.orderItems.length || 0} />
                                                </div>
                                            </div>
                                            <UpdateOrderItemNoteInput orderItem={item} />
                                        </div>
                                    ))}
                                </div>
                                {/* order note */}
                                <div className="flex flex-col items-end py-4 mt-4 border-t border-muted-foreground/40">
                                    <UpdateOrderNoteInput onSuccess={handleUpdateOrderNoteSuccess} order={orderItems} />
                                </div>
                                <StaffVoucherListSheetInUpdateOrder defaultValue={orderItems || undefined} onSuccess={refetch} />
                                <div>
                                    {orderItems?.voucher && (
                                        <div className="flex justify-start w-full">
                                            <div className="flex flex-col items-start">
                                                <div className="flex gap-2 items-center mt-2">
                                                    <span className="text-xs text-muted-foreground">
                                                        {t('order.usedVoucher')}:
                                                    </span>
                                                    <span className="px-3 py-1 text-xs font-semibold rounded-full border border-primary bg-primary/20 text-primary">
                                                        -{`${formatCurrency(cartTotals?.voucherDiscount || 0)}`}
                                                    </span>
                                                </div>

                                                {/* Hiển thị nội dung chi tiết theo loại voucher */}
                                                <div className="mt-1 text-xs italic text-muted-foreground">
                                                    {(() => {
                                                        const voucher = orderItems?.voucher
                                                        if (!voucher) return null

                                                        switch (voucher.type) {
                                                            case VOUCHER_TYPE.PERCENT_ORDER:
                                                                return `${tVoucher('voucher.discountValue')}${voucher.value}% ${tVoucher('voucher.orderValue')}`

                                                            case VOUCHER_TYPE.FIXED_VALUE:
                                                                return `${tVoucher('voucher.discountValue')}${formatCurrency(voucher.value)} ${tVoucher('voucher.orderValue')}`

                                                            case VOUCHER_TYPE.SAME_PRICE_PRODUCT:
                                                                return `${tVoucher('voucher.samePrice')} ${formatCurrency(voucher.value)} ${tVoucher('voucher.forSelectedProducts')}`

                                                            default:
                                                                return ''
                                                        }
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col items-end pt-4 mt-4 border-t border-muted-foreground/40">
                                    <div className="space-y-1 w-2/3">
                                        <div className="grid grid-cols-5">
                                            <span className="col-span-3 text-sm text-muted-foreground">{t('order.total')}</span>
                                            <span className="col-span-2 text-sm text-right text-muted-foreground">
                                                {/* {formatCurrency(orderItems ? orderItems.subtotal : 0)} */}
                                                {/* {formatCurrency(orderItems?.subtotal || 0)} */}
                                                {formatCurrency(cartTotals?.subTotalBeforeDiscount || 0)}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-5">
                                            <span className="col-span-3 text-sm text-muted-foreground">{t('order.promotionDiscount')}</span>
                                            <span className="col-span-2 text-sm text-right text-muted-foreground">
                                                - {formatCurrency(cartTotals?.promotionDiscount || 0)}
                                                {/* {formatCurrency(orderItems?.voucher ? (orderItems.subtotal * (orderItems.voucher.value || 0)) / 100 : 0)} */}
                                            </span>
                                        </div>
                                        {order?.result.voucher &&
                                            <div className="flex justify-between pb-4 w-full border-b">
                                                <h3 className="text-sm italic font-medium text-green-500">
                                                    {t('order.voucher')}
                                                </h3>
                                                <p className="text-sm italic font-semibold text-green-500">
                                                    - {`${formatCurrency(cartTotals?.voucherDiscount || 0)}`}
                                                </p>
                                            </div>}

                                        <div className="grid grid-cols-5 pt-2 mt-4 border-t">
                                            <span className="col-span-3 text-lg font-bold">{t('order.subtotal')}</span>
                                            <span className="col-span-2 font-semibold text-right text-md text-primary sm:text-2xl">
                                                {formatCurrency(cartTotals?.finalTotal || 0)}
                                            </span>
                                        </div>
                                        {/* <span className="text-xs text-muted-foreground">({t('order.vat')})</span> */}
                                    </div>

                                </div>
                            </div>
                        </ScrollArea>

                        {order?.result?.status === "pending" &&
                            <div className="flex justify-end mt-3 w-full">
                                <Button
                                    disabled={(orderType === OrderTypeEnum.AT_TABLE && !table) || orderItems?.orderItems.length === 0}
                                    onClick={handleClickPayment}>{t('order.continueToPayment')}</Button>
                            </div>}
                    </div>
                </div>
            }

        </div>
    )
}
