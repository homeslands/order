import _ from 'lodash'
import { ShoppingCart, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'

import { Badge, Button, ScrollArea } from '@/components/ui'
import { OrderTypeInUpdateOrderSelect } from '@/components/app/select'
import { calculateOrderItemDisplay, calculatePlacedOrderTotals, capitalizeFirstLetter, formatCurrency, transformOrderItemToOrderDetail } from '@/utils'
import { IOrderItem, IVoucherProduct, OrderStatus, OrderTypeEnum } from '@/types'
import { StaffVoucherListSheetInUpdateOrderWithLocalStorage } from '@/components/app/sheet'
import { VOUCHER_TYPE } from '@/constants'
import UpdateOrderQuantity from './update-quantity'
import { useOrderFlowStore } from '@/stores'
import { OrderItemNoteInUpdateOrderInput, OrderNoteInUpdateOrderInput } from '@/components/app/input'
import { ConfirmUpdateOrderDialog } from '@/components/app/dialog'
import { useIsMobile } from '@/hooks'

interface UpdateOrderContentProps {
    orderType: OrderTypeEnum
    table: string
}

export default function UpdateOrderContent({
    orderType,
    table,
}: UpdateOrderContentProps) {
    const { t } = useTranslation(['menu'])
    const { t: tCommon } = useTranslation(['common'])
    const { t: tVoucher } = useTranslation(['voucher'])
    const { updatingData, removeDraftItem } = useOrderFlowStore()
    const isMobile = useIsMobile()

    const voucher = updatingData?.updateDraft?.voucher || null
    const orderItems = updatingData?.updateDraft?.orderItems || []
    const transformedOrderItems = transformOrderItemToOrderDetail(orderItems)
    const displayItems = calculateOrderItemDisplay(transformedOrderItems, voucher)
    const cartTotals = calculatePlacedOrderTotals(displayItems, voucher)

    const handleRemoveCartItem = (id: string) => {
        removeDraftItem(id)
    }

    return (
        <div
            className={`flex flex-col ${isMobile
                ? 'w-screen max-w-none -mx-2 sm:-mx-6 sm:px-6 min-h-[50vh] border-t border-b bg-background'
                : 'z-30 fixed right-0 top-14 h-[calc(100vh-3.5rem)] w-full md:w-[26%] xl:w-[25%] shadow-lg overflow-hidden bg-background transition-all duration-300'
                }`}
        >
            {/* Header */}
            <div className={`flex flex-col gap-2 p-2 ${isMobile ? 'border-b bg-background' : 'backdrop-blur-sm shrink-0 bg-background/95'}`}>
                <div className='flex items-center'>
                    <div className="w-full">
                        <OrderTypeInUpdateOrderSelect typeOrder={orderType} />
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <ScrollArea className={`${isMobile ? 'overflow-y-auto p-0 max-h-[35vh] min-h-[200px]' : 'flex-1 p-0 scrollbar-hidden'}`}>
                <div className={`flex flex-col gap-2 p-2 ${isMobile ? 'pb-4' : ''}`}>
                    <AnimatePresence>
                        {orderItems && orderItems.length > 0 ? (
                            orderItems.map((item: IOrderItem, index: number) => {
                                const displayItem = displayItems.find(di => di.productSlug === item.productSlug)

                                const original = item.variant.price || 0
                                const priceAfterPromotion = displayItem?.priceAfterPromotion || original
                                const finalPrice = displayItem?.finalPrice || priceAfterPromotion

                                const isSamePriceVoucher =
                                    voucher?.type === VOUCHER_TYPE.SAME_PRICE_PRODUCT &&
                                    voucher?.voucherProducts?.some((vp: IVoucherProduct) => vp.product?.slug === item.slug)

                                const hasPromotionDiscount = (displayItem?.promotionDiscount || 0) > 0
                                const hasVoucherDiscount = (displayItem?.voucherDiscount || 0) > 0

                                // Use finalPrice for display when there's voucher discount, otherwise use priceAfterPromotion
                                const displayPrice = hasVoucherDiscount
                                    ? finalPrice
                                    : hasPromotionDiscount
                                        ? priceAfterPromotion
                                        : original

                                const shouldShowLineThrough = hasVoucherDiscount || hasPromotionDiscount || isSamePriceVoucher

                                return (
                                    <motion.div
                                        key={item.id || item.slug}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex flex-col gap-1 p-2 transition-colors border rounded-lg border-primary/80 group bg-primary/10"
                                    >
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <div className='flex items-center justify-between'>
                                                <div className='flex items-end gap-1'>
                                                    <span className="text-[13px] xl:text-sm font-semibold truncate max-w-[9rem] xl:max-w-[15rem]">
                                                        {item.name}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className='flex items-center justify-between'>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-muted-foreground">
                                                        ({capitalizeFirstLetter(item.variant.size.name)})
                                                    </span>
                                                    <div className="flex flex-col items-start gap-1 mt-1">
                                                        {shouldShowLineThrough && original !== finalPrice && (
                                                            <span className="text-[10px] line-through text-muted-foreground">
                                                                {formatCurrency(original)}
                                                            </span>
                                                        )}
                                                        <span className="text-[10px] font-bold text-primary">
                                                            {formatCurrency(displayPrice)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <UpdateOrderQuantity orderItem={item} />
                                                    <Button
                                                        title={t('common.remove')}
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemoveCartItem(item.id)}
                                                        className="hover:bg-destructive/10 hover:text-destructive"
                                                    >
                                                        <Trash2 size={18} className='icon text-destructive' />
                                                    </Button>
                                                </div>
                                            </div>
                                            <OrderItemNoteInUpdateOrderInput orderItem={item} />
                                        </div>
                                    </motion.div>
                                )
                            })
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center min-h-[12rem] gap-2 text-muted-foreground"
                            >
                                <div className="p-2 rounded-full bg-muted/30">
                                    <ShoppingCart className="w-10 h-10" />
                                </div>
                                <div className="space-y-1 text-center">
                                    <p className="font-medium">{tCommon('common.noData')}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </ScrollArea>

            {/* Footer - Payment */}
            {orderItems && orderItems.length > 0 && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className={`p-2 border-t ${isMobile ? 'bg-background' : 'z-10 backdrop-blur-sm shrink-0 bg-background/95'}`}
                >
                    <div className='space-y-1'>
                        <div className="flex flex-col">
                            <OrderNoteInUpdateOrderInput order={updatingData?.updateDraft} />
                            <StaffVoucherListSheetInUpdateOrderWithLocalStorage />
                        </div>

                        <div>
                            {voucher && (
                                <div className="flex justify-start w-full">
                                    <div className="flex flex-col items-start">
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[10px] text-muted-foreground">
                                                {t('order.usedVoucher')}
                                            </span>
                                            <Badge variant='outline' className="px-1 text-[10px] border-primary text-primary">
                                                -{formatCurrency(cartTotals?.voucherDiscount || 0)}
                                            </Badge>
                                        </div>

                                        {/* Hiển thị nội dung chi tiết theo loại voucher */}
                                        <div className="text-[10px] italic text-muted-foreground">
                                            {(() => {
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

                        <div className="space-y-1 text-sm">
                            <div className="flex flex-col w-full text-sm text-muted-foreground">
                                {/* Tổng giá gốc */}
                                <div className="flex justify-between text-xs">
                                    <span>{t('order.subtotalBeforeDiscount')}</span>
                                    <span>{formatCurrency(cartTotals?.subTotalBeforeDiscount || 0)}</span>
                                </div>

                                {/* Giảm giá khuyến mãi (promotion) */}
                                {(cartTotals?.promotionDiscount || 0) > 0 && (
                                    <div className="flex justify-between text-[10px] italic text-yellow-600">
                                        <span>{t('order.promotionDiscount')}</span>
                                        <span>-{formatCurrency(cartTotals?.promotionDiscount || 0)}</span>
                                    </div>
                                )}

                                {/* Tổng giảm giá voucher */}
                                {(cartTotals?.voucherDiscount || 0) > 0 && (
                                    <div className="flex justify-between text-[10px] italic text-green-600">
                                        <span>{t('order.voucherDiscount')}</span>
                                        <span>-{formatCurrency(cartTotals?.voucherDiscount || 0)}</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-2 mt-2 font-semibold border-t text-md">
                                    <span>{t('order.totalPayment')}</span>
                                    <span className="text-2xl font-bold text-primary">{formatCurrency(cartTotals?.finalTotal || 0)}</span>
                                </div>
                            </div>

                            {updatingData?.originalOrder?.status === OrderStatus.PENDING && (
                                <div className='flex items-center justify-end'>
                                    <ConfirmUpdateOrderDialog
                                        disabled={orderType === OrderTypeEnum.AT_TABLE && !table}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
} 