import { useState, useEffect } from "react"
import { X } from "lucide-react"

import { Input, Button } from "@/components/ui"
import { useTranslation } from "react-i18next"
import { useApplyLoyaltyPoint, useCancelReservationForOrder } from "@/hooks"

interface LoyaltyPointsInputProps {
    orderSlug: string
    totalPoints: number
    orderTotal: number
    value?: number
    onChange: (value: number) => void
    placeholder?: string
    onSuccess: () => void
}

export default function LoyaltyPointsInput({
    orderSlug,
    totalPoints,
    orderTotal,
    value = 0,
    onChange,
    placeholder,
    onSuccess,
}: LoyaltyPointsInputProps) {
    const { t } = useTranslation(['loyaltyPoint'])
    const [displayValue, setDisplayValue] = useState<string>(
        value ? new Intl.NumberFormat("vi-VN").format(value) : ""
    )
    const { mutate: applyLoyaltyPoint } = useApplyLoyaltyPoint()
    const { mutate: cancelReservationForOrder } = useCancelReservationForOrder()

    // Sync displayValue when value prop changes
    useEffect(() => {
        if (value !== undefined) {
            setDisplayValue(value ? new Intl.NumberFormat("vi-VN").format(value) : "")
        }
    }, [value])

    const formatNumber = (raw: string) => {
        if (!raw) return ""
        return new Intl.NumberFormat("vi-VN").format(Number(raw))
    }

    // Calculate maximum points that can be used (minimum of totalPoints and orderTotal)
    const maxPoints = Math.min(totalPoints, orderTotal)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // giữ lại số
        const raw = e.target.value.replace(/\D/g, "")
        if (raw === "") {
            setDisplayValue("")
            onChange(0)
            return
        }

        let num = Number(raw)
        if (num > maxPoints) {
            num = maxPoints
        }

        setDisplayValue(formatNumber(String(num)))
        onChange(num)
    }

    const handleQuickSelect = (amount: number) => {
        const selectedAmount = Math.min(amount, maxPoints)
        setDisplayValue(formatNumber(String(selectedAmount)))
        onChange(selectedAmount)
    }

    const handleClear = () => {
        setDisplayValue("")
        onChange(0)
    }

    // Quick select options
    const quickOptions = [5000, 10000, 20000, 50000, maxPoints].filter(amount => amount > 0)

    const handleApply = () => {
        applyLoyaltyPoint({ orderSlug, pointsToUse: value }, {
            onSuccess: () => {
                onSuccess()
            }
        })
    }

    const handleCancel = () => {
        cancelReservationForOrder(orderSlug, {
            onSuccess: () => {
                onChange(0)
                onSuccess()
            }
        })
    }

    return (
        <div className="space-y-3">
            <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                    <Input
                        type="text"
                        inputMode="numeric"
                        value={displayValue}
                        onChange={handleChange}
                        placeholder={placeholder}
                        className="pr-8 text-sm"
                    />
                    {displayValue && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
                <Button type="button" onClick={handleApply} disabled={value <= 0} className="text-sm">
                    {t('loyaltyPoint.apply')}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} className="text-sm">
                    {t('loyaltyPoint.cancel')}
                </Button>
            </div>

            {/* Quick select buttons */}
            <div className="flex flex-wrap gap-2">
                {quickOptions.map((amount) => (
                    <Button
                        key={amount}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickSelect(amount)}
                        className="text-xs"
                    >
                        {amount === maxPoints ? t('loyaltyPoint.maximum') : `${(amount / 1000).toFixed(0)}K`}
                    </Button>
                ))}
            </div>

            {/* Validation message */}
            {maxPoints < totalPoints && (
                <p className="text-xs text-muted-foreground">
                    {t('loyaltyPoint.maximumCanBeUsed')}: {maxPoints.toLocaleString()} {t('loyaltyPoint.points')} ({t('loyaltyPoint.limitedByOrderTotal')})
                </p>
            )}
        </div>
    )
}
