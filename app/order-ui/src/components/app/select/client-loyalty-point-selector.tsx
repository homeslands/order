import { useEffect, useState } from "react"
import { Coins } from "lucide-react"
import { useTranslation } from "react-i18next"

import { Badge, Label, Switch } from "@/components/ui"
import { useApplyLoyaltyPoint, useCancelReservationForOrder, useLoyaltyPoints } from "@/hooks"
import { LoyaltyPointInput } from "../input"

interface ClientLoyaltyPointSelectorProps {
    usedPoints: number
    orderSlug: string
    ownerSlug: string | null
    total: number
    onSuccess: () => void
}

export default function ClientLoyaltyPointSelector({ usedPoints, orderSlug, ownerSlug, total, onSuccess }: ClientLoyaltyPointSelectorProps) {
    const { t } = useTranslation('loyaltyPoint')
    const [error, setError] = useState<string | null>(null)
    const { data: loyaltyPoints } = useLoyaltyPoints(ownerSlug ?? '')

    const totalPoints = loyaltyPoints?.totalPoints ?? 0
    // Base total before applying points: current subtotal + already used points
    const baseOrderTotal = total + usedPoints
    const maxUsablePoints = Math.min(totalPoints, baseOrderTotal)

    const [useAllPoints, setUseAllPoints] = useState(false)
    const [pointsInput, setPointsInput] = useState(usedPoints)
    const { mutate: applyLoyaltyPoint } = useApplyLoyaltyPoint()
    const { mutate: cancelReservationForOrder } = useCancelReservationForOrder()

    // Sync local states when upstream usedPoints changes (e.g., voucher removed resets points to 0)
    useEffect(() => {
        setPointsInput(usedPoints)
        if (usedPoints === 0 && useAllPoints) {
            setUseAllPoints(false)
            setError(null)
        }
    }, [usedPoints, useAllPoints])

    const handleUseAllPointsToggle = (checked: boolean) => {
        setUseAllPoints(checked)
        if (checked) {
            // Apply maximum usable points when switch is on
            applyLoyaltyPoint({ orderSlug: orderSlug ?? '', pointsToUse: maxUsablePoints }, {
                onSuccess: () => {
                    onSuccess()
                }
            })
            setPointsInput(maxUsablePoints)
            setError(null)
        } else {
            // Reset to 0 when turning off use all points
            cancelReservationForOrder(orderSlug, {
                onSuccess: () => {
                    onSuccess()
                }
            })
            setPointsInput(0)
            setError(null)
        }
    }

    return <div>
        <div className="flex flex-col gap-2 mt-6 w-full rounded-md border bg-background">
            <div className="flex flex-col gap-1 p-4 bg-muted">
                <Label className="text-md">{t('loyaltyPoint.title')}</Label>
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2 items-center">
                        <Badge className="text-xs">
                            <Coins className="mr-1 w-3 h-3" />
                            {t('loyaltyPoint.youHavePoints', { points: totalPoints.toLocaleString() })}
                        </Badge>
                    </div>
                    {maxUsablePoints < totalPoints && (
                        <p className="text-xs text-muted-foreground">
                            {t('loyaltyPoint.maximumCanBeUsed')}
                        </p>
                    )}
                </div>
            </div>
            <div className="p-4 space-y-4">
                {/* Use All Points Switch */}
                <div className="flex justify-between items-center">
                    <Label htmlFor="use-all-switch" className="text-sm font-medium">
                        {t('loyaltyPoint.useAll')}
                    </Label>
                    <Switch
                        id="use-all-switch"
                        checked={useAllPoints}
                        onCheckedChange={handleUseAllPointsToggle}
                    />
                </div>

                {/* Conditional Controls - Only show when switch is off */}
                {!useAllPoints && (
                    <>
                        {/* Points Input */}
                        <div className="space-y-2">
                            <Label htmlFor="points-input" className="text-sm font-medium">
                                {t('loyaltyPoint.enterPointsToRedeem')}
                            </Label>
                            <div className='relative'>
                                <LoyaltyPointInput
                                    orderSlug={orderSlug}
                                    totalPoints={totalPoints}
                                    orderTotal={baseOrderTotal}
                                    value={pointsInput}
                                    onChange={(value) => {
                                        setPointsInput(value)
                                    }}
                                    placeholder={t('loyaltyPoint.enterPointsToRedeem')}
                                    onSuccess={onSuccess}
                                />
                            </div>
                            {error && <p className="text-xs text-destructive">{error}</p>}
                        </div>
                    </>
                )}
            </div>

            {/* Real-time Calculation */}
            {pointsInput > 0 && (
                <div className="p-4 space-y-2 rounded-lg bg-muted">
                    <div className="flex justify-between text-sm">
                        <span>{t('loyaltyPoint.discountAmount')}</span>
                        <span className="font-medium text-green-500">-{usedPoints.toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between pt-2 text-sm font-bold border-t">
                        <span>{t('loyaltyPoint.newTotal')}</span>
                        <span className="text-lg font-bold text-primary">{(total).toLocaleString()}đ</span>
                    </div>
                </div>
            )}
        </div>
    </div>
}