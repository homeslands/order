import { useEffect } from "react"
import { QrCode } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Badge } from "@/components/ui"
import { formatCurrency } from "@/utils"
import { useCartItemStore } from "@/stores"
import { ROUTE } from "@/constants"

export default function ClientViewPage() {
    const { t } = useTranslation("menu")
    // const { t: tCommon } = useTranslation("common")
    const { getCartItems } = useCartItemStore()
    const cartItems = getCartItems()

    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'cart-store') {
                useCartItemStore.persist.rehydrate()
            }
        }

        const pathname = window.location.pathname
        if (pathname === ROUTE.STAFF_CLIENT_VIEW) {
            window.addEventListener('storage', handleStorage)
        }

        return () => {
            window.removeEventListener('storage', handleStorage)
        }
    }, [])

    const totalPrice =
        cartItems?.orderItems.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
        ) || 0

    return (
        <div className="container gap-4 p-4 mx-auto">
            <h1 className="mb-4 text-2xl font-bold">{t("menu.orderInformation")}</h1>
            <div className="flex flex-col justify-center gap-4 text-[16px] md:text-[18px]">
                <h2 className="text-lg font-semibold">{t("menu.customerInformation")}</h2>
                <div className="space-y-1 text-muted-foreground">
                    <div>
                        <span className="font-bold text-foreground">
                            {t("menu.customerName")}:
                        </span>{" "}
                        {cartItems?.ownerFullName || "-"}
                    </div>
                    <div>
                        <span className="font-bold text-foreground">
                            {t("menu.customerPhone")}:
                        </span>{" "}
                        {cartItems?.ownerPhoneNumber || "-"}
                    </div>
                    <div className="flex gap-2 items-center">
                        <span>
                            <span className="font-bold text-foreground">
                                {t("menu.orderType")}:
                            </span>{" "}
                            {cartItems?.type === "at-table"
                                ? t("menu.dineIn")
                                : t("menu.takeAway")}
                        </span>
                        {cartItems?.tableName && (
                            <Badge className="px-2 py-1 text-sm">
                                {t("menu.tableNumber")} {cartItems.tableName}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="overflow-x-auto col-span-3 rounded-lg border">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-muted-foreground/10">
                            <tr className="text-muted-foreground">
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
                                        {item.note && (
                                            <div className="flex gap-1 items-start">
                                                <span>{item.note}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex gap-2 items-center">
                                            {item?.originalPrice && item?.originalPrice > item.price && (
                                                <span className="text-sm line-through text-muted-foreground">
                                                    {formatCurrency(item?.originalPrice)}
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
                                <td colSpan={4} className="px-4 py-2 text-xl">
                                    {t("menu.total")}
                                </td>
                                <td colSpan={2} className="px-4 py-2 text-2xl font-bold text-primary">
                                    {formatCurrency(totalPrice)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                {cartItems?.id && (
                    <div className="flex flex-col col-span-1 justify-center items-center mt-8">
                        <p className="mb-2 text-base font-medium">
                            {t("paymentMethod.scanToPay")}
                        </p>
                        <div className="p-2 bg-white rounded-xl border border-muted-foreground/50">
                            <QrCode size={220} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
