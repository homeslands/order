import { useEffect } from "react"
import { useTranslation } from "react-i18next"

import { Badge } from "@/components/ui"
import { formatCurrency } from "@/utils"
import { useCartItemStore, usePaymentMethodStore, usePaymentStore } from "@/stores"
import { ROUTE } from "@/constants"
import { useOrderBySlug } from "@/hooks"
import { OrderStatus } from "@/types"
import DownloadQrCode from "@/components/app/button/download-qr-code"

export default function ClientViewPage() {
    const { t } = useTranslation("menu")
    const { getCartItems } = useCartItemStore()
    const cartItems = getCartItems()
    const { orderSlug } = usePaymentStore()
    const { qrCode } = usePaymentMethodStore()

    const { refetch: refetchOrder } = useOrderBySlug(orderSlug as string)

    // Polling order status every 3 seconds
    useEffect(() => {
        if (!orderSlug) return
        const polling = setInterval(async () => {
            const updatedOrder = await refetchOrder()
            const status = updatedOrder.data?.result?.status
            if (status === OrderStatus.PAID) clearInterval(polling)
        }, 3000)

        return () => clearInterval(polling)
    }, [orderSlug, refetchOrder])

    // Listen to storage changes for syncing Zustand persisted state
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === "cart-store") useCartItemStore.persist.rehydrate()
            if (e.key === "payment-storage") usePaymentStore.persist.rehydrate()
        }

        if (window.location.pathname === ROUTE.STAFF_CLIENT_VIEW) {
            window.addEventListener("storage", handleStorage)
        }

        return () => window.removeEventListener("storage", handleStorage)
    }, [])

    const totalPrice = cartItems?.orderItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    ) || 0

    const renderQRCode = () => {
        if (qrCode && orderSlug) {
            return (
                <div className="flex flex-col items-center p-2 bg-white rounded-xl border border-muted-foreground/50">
                    <p className="mb-2 text-base font-medium">{t("paymentMethod.scanToPay")}</p>
                    <DownloadQrCode qrCode={qrCode} slug={orderSlug} />
                </div>
            )
        }

        return null
    }

    return (
        <div className="container gap-4 p-4 mx-auto">
            <h1 className="mb-4 text-2xl font-bold">{t("menu.orderInformation")}</h1>

            {/* Customer Info */}
            <div className="flex flex-col gap-4 text-[16px] md:text-[18px]">
                <h2 className="text-lg font-semibold">{t("menu.customerInformation")}</h2>
                <div className="space-y-1 text-muted-foreground">
                    {cartItems?.ownerFullName && (
                        <div>
                            <span className="font-bold text-foreground">{t("menu.customerName")}:</span>{" "}
                            {cartItems.ownerPhoneNumber || "-"}
                        </div>
                    )}
                    {cartItems?.type && (
                        <div className="flex gap-2 items-center">
                            <span>
                                <span className="font-bold text-foreground">{t("menu.orderType")}:</span>{" "}
                                {cartItems.type === "at-table" ? t("menu.dineIn") : t("menu.takeAway")}
                            </span>
                            {cartItems.tableName && (
                                <Badge className="px-2 py-1 text-sm">
                                    {t("menu.tableNumber")} {cartItems.tableName}
                                </Badge>
                            )}
                        </div>
                    )}
                    {cartItems?.description && (
                        <div className="text-muted-foreground">
                            <span className="font-bold text-foreground">{t("menu.description")}:</span>{" "}
                            {cartItems.description}
                        </div>
                    )}
                </div>
            </div>

            {/* Order Items */}
            <div className={`grid gap-4 mt-4 ${qrCode ? "grid-cols-4" : "grid-cols-1"}`}>
                <div className={`overflow-x-auto col-span-3 rounded-lg border ${qrCode ? "":"col-span-4"}`}>
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-muted-foreground/10 text-muted-foreground">
                            <tr>
                                <th className="px-4 py-2">{t("menu.productName")}</th>
                                <th className="px-4 py-2">{t("menu.quantity")}</th>
                                <th className="px-4 py-2">{t("menu.size")}</th>
                                <th className="px-4 py-2">{t("menu.note")}</th>
                                <th className="px-4 py-2">{t("menu.price")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cartItems?.orderItems?.map((item) => (
                                <tr key={item.id} className="border-b">
                                    <td className="px-4 py-2 font-medium">{item.name}</td>
                                    <td className="px-4 py-2">{item.quantity}</td>
                                    <td className="px-4 py-2 uppercase">{item.size}</td>
                                    <td className="px-4 py-2 text-muted-foreground">
                                        {item.note && <span>{item.note}</span>}
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex gap-2 items-center">
                                            {item.originalPrice && item.originalPrice > item.price && (
                                                <span className="text-sm line-through text-muted-foreground">
                                                    {formatCurrency(item.originalPrice)}
                                                </span>
                                            )}
                                            <span className="font-semibold text-primary">
                                                {formatCurrency(item.price)}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="font-semibold bg-muted-foreground/10">
                                <td colSpan={4} className="px-4 py-2 text-xl">{t("menu.total")}</td>
                                <td colSpan={2} className="px-4 py-2 text-2xl font-bold text-primary">
                                    {formatCurrency(totalPrice)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* QR Code */}
                {renderQRCode()}
            </div>
        </div>
    )
}
