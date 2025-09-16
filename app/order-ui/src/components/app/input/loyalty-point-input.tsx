import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"

import { Input, Button } from "@/components/ui"
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
    const [isApplied, setIsApplied] = useState<boolean>(false)

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
        // keep only numbers
        const raw = e.target.value.replace(/\D/g, "")
        if (raw === "") {
            setDisplayValue("")
            onChange(0)
            if (isApplied) {
                // Auto-cancel reservation when user clears the input after applying
                cancelReservationForOrder(orderSlug, {
                    onSuccess: () => {
                        setIsApplied(false)
                        onSuccess()
                    }
                })
            }
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

    // Quick select options
    // const quickOptions = [...new Set([5000, 10000, 20000, 50000, maxPoints])].filter(amount => amount > 0).sort((a, b) => a - b)

    // Quick select options - chỉ hiển thị các giá trị cố định nhỏ hơn maxPoints
    const fixedOptions = [1000, 2000, 3000, 5000, 10000, 20000, 50000].filter(amount => amount < maxPoints)
    // Thêm maxPoints vào cuối nếu nó lớn hơn giá trị cố định lớn nhất
    const quickOptions = maxPoints > (fixedOptions[fixedOptions.length - 1] || 0)
        ? [...fixedOptions, maxPoints]
        : fixedOptions

    const handleApply = () => {
        applyLoyaltyPoint({ orderSlug, pointsToUse: value }, {
            onSuccess: () => {
                setIsApplied(true)
                onSuccess()
            }
        })
    }

    const handleCancel = () => {
        cancelReservationForOrder(orderSlug, {
            onSuccess: () => {
                onChange(0)
                setIsApplied(false)
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
                </div>
                <Button type="button" onClick={handleApply} disabled={value <= 0} className="text-sm">
                    {t('loyaltyPoint.apply')}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} disabled={!isApplied} className="text-sm">
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
                        {/* Chỉ hiển thị Maximum khi amount là maxPoints và khác với các giá trị cố định */}
                        {amount === maxPoints && !([1000, 2000, 3000, 5000, 10000, 20000, 50000].includes(amount))
                            ? t('loyaltyPoint.maximum')
                            : `${(amount / 1000).toFixed(0)}K`
                        }
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
