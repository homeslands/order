import { useTranslation } from "react-i18next"

import { IOrderDetail } from "@/types"
import { formatCurrency } from "@/utils"

interface OrderInformationProps {
    orderDetailData: IOrderDetail
}

export default function OrderInformation({ orderDetailData }: OrderInformationProps) {
    const { t } = useTranslation('menu')

    const originalPrice = orderDetailData.variant.price
    const priceAfterDiscount = orderDetailData?.promotion && orderDetailData?.promotion?.value
        ? orderDetailData.variant.price * (1 - orderDetailData.promotion.value / 100)
        : orderDetailData.variant.price

    return (
        <div className="flex flex-col gap-4 p-4 rounded-lg border bg-muted/40">
            {/* Product Information */}
            <div className="flex flex-col gap-2">
                <div className="grid grid-cols-5 justify-between items-center">
                    <div className="flex flex-col col-span-4 gap-1">
                        <h3 className="text-lg font-semibold">{orderDetailData.variant.product.name}</h3>
                        <p className="text-sm text-muted-foreground">{orderDetailData.variant.product.description}</p>
                    </div>
                    <div className="flex flex-col col-span-1 gap-1 items-end">
                        <span className="text-sm text-muted-foreground">{t('order.quantity')}: {orderDetailData.quantity}</span>
                        <div className="flex flex-row gap-2 items-center">
                            {orderDetailData?.promotion && orderDetailData?.promotion?.value > 0 && (
                                <div className="text-sm font-semibold line-through text-muted-foreground">
                                    {formatCurrency(originalPrice)}
                                </div>
                            )}
                            <div className="text-lg font-semibold text-primary">
                                {formatCurrency(priceAfterDiscount)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Size Information */}
                {orderDetailData.variant.size && (
                    <div className="flex gap-2 items-center">
                        <span className="text-sm font-bold">{t('order.size')}:</span>
                        <span className="text-sm text-muted-foreground">{orderDetailData.variant.size.name.toLocaleUpperCase()}</span>
                    </div>
                )}

                {/* Note */}
                {orderDetailData.note && (
                    <div className="grid grid-cols-6 gap-2 items-center py-2 rounded-md bg-muted/20">
                        <span className="col-span-1 text-sm font-bold">{t('order.note')}:</span>
                        <span className="col-span-5 p-1 pl-2 w-full text-sm rounded-md border border-muted-foreground/40 text-muted-foreground">{orderDetailData.note}</span>
                    </div>
                )}
            </div>

            {/* Promotion Information */}
            {orderDetailData?.promotion && (
                <div className="flex gap-2 items-center p-2 rounded-md bg-primary/10">
                    <span className="text-sm font-medium text-primary">{t('order.promotion')}:</span>
                    <span className="text-sm text-primary">{orderDetailData.promotion.title}</span>
                    {orderDetailData.promotion.value > 0 && (
                        <span className="text-sm text-primary">-{orderDetailData.promotion.value}%</span>
                    )}
                </div>
            )}

            {/* Total */}
            <div className="flex justify-end pt-4 mt-4 border-t">
                <div className="text-lg font-semibold">
                    {t('order.total')}:{" "}
                    <span className="text-2xl text-primary">{formatCurrency(orderDetailData.subtotal)}</span>
                </div>
            </div>
        </div>
    )
}
