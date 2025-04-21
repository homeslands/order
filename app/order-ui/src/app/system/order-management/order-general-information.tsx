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
        <div className="flex flex-col gap-3">
            <div
                key={orderDetailData.slug}
                className="flex justify-between items-center p-3 rounded-lg border bg-muted/40"
            >
                <div className="flex gap-6 items-center">
                    <span className="font-medium">{orderDetailData.variant.product.name}</span>
                    <span className="text-sm text-muted-foreground">{t('order.quantity')}: {orderDetailData.quantity}</span>
                </div>
                <div className="flex flex-row gap-1 items-center text-right">
                    <div className="text-sm font-semibold line-through text-muted-foreground">
                        {formatCurrency(originalPrice)}
                    </div>
                    <div className="text-xl font-semibold text-primary">
                        {formatCurrency(priceAfterDiscount)}
                    </div>
                </div>
            </div>

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
