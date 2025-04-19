import { useTranslation } from "react-i18next"

import { IOrder } from "@/types"
import { formatCurrency } from "@/utils"

export default function OrderInformation({ orderDetailData }: { orderDetailData: IOrder }) {
    const { t } = useTranslation('menu')

    const hasItems = orderDetailData?.orderItems && orderDetailData.orderItems.length > 0

    const total = hasItems
        ? orderDetailData.orderItems.reduce(
            (sum, item) => sum + item.variant.price * item.quantity,
            0
        )
        : 0

    return (
        <div className="flex flex-col gap-3">
            {hasItems && orderDetailData.orderItems.map((item) => (
                <div
                    key={item.slug}
                    className="flex justify-between items-center p-3 rounded-lg border bg-muted/40"
                >
                    <div className="flex gap-6 items-center">
                        <span className="font-medium">{item.variant.product.name}</span>
                        <span className="text-sm text-muted-foreground">{t('order.quantity')}: {item.quantity}</span>
                    </div>
                    <div className="text-right">
                        <div className="font-semibold text-muted-foreground">
                            {formatCurrency(item.variant.price * item.quantity)}
                        </div>
                    </div>
                </div>
            ))}

            {/* Total */}
            {hasItems && (
                <div className="flex justify-end pt-4 mt-4 border-t">
                    <div className="text-lg font-semibold">
                        {t('order.total')}:{" "}
                        <span className="text-2xl text-primary">{formatCurrency(total)}</span>
                    </div>
                </div>
            )}
        </div>
    )
}
