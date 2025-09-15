import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui"
import { useOrderFlowStore } from "@/stores"
import { OrderTypeEnum } from "@/types"

interface IPickupTimeSelectProps {
    pickupTime?: number
    orderType: OrderTypeEnum
    onPickupTimeSelect?: (minutes: number) => void
}

const PICKUP_TIME_OPTIONS = [0, 5, 10, 15, 30, 45, 60]

export default function PickupTimeSelectInUpdateOrder({
    pickupTime,
    orderType,
    onPickupTimeSelect,
}: IPickupTimeSelectProps) {
    const { t } = useTranslation("menu")
    const { getCartItems, addDraftPickupTime } = useOrderFlowStore()

    const [selectedTime, setSelectedTime] = useState<string>("0")
    const [isUpdatingFromProps, setIsUpdatingFromProps] = useState(false)

    const cartItems = getCartItems()

    useEffect(() => {
        // Only update selectedTime from props
        if (pickupTime !== undefined) {
            setIsUpdatingFromProps(true)
            setSelectedTime(pickupTime.toString())
            // Reset flag after a tick to avoid affecting user actions
            setTimeout(() => setIsUpdatingFromProps(false), 0)
        } else if (cartItems?.timeLeftTakeOut !== undefined) {
            setIsUpdatingFromProps(true)
            setSelectedTime(cartItems.timeLeftTakeOut.toString())
            setTimeout(() => setIsUpdatingFromProps(false), 0)
        } else {
            // If no pickupTime and cart has no time, set to 0
            setIsUpdatingFromProps(true)
            setSelectedTime("0")
            addDraftPickupTime(0)
            setTimeout(() => setIsUpdatingFromProps(false), 0)
        }
    }, [pickupTime, cartItems?.timeLeftTakeOut, addDraftPickupTime])

    // Don't render for non-takeout orders
    if (orderType !== OrderTypeEnum.TAKE_OUT) {
        return null
    }

    const handlePickupTimeSelect = (value: string) => {
        // Skip if updating from props to avoid unwanted triggers
        if (isUpdatingFromProps) return

        const minutes = parseInt(value, 10)
        setSelectedTime(value)
        addDraftPickupTime(minutes)
        onPickupTimeSelect?.(minutes)
    }

    return (
        <Select onValueChange={handlePickupTimeSelect} value={selectedTime}>
            <SelectTrigger
                className={`w-full bg-white dark:bg-transparent ${!selectedTime ? "highlight-blink-border" : ""}`}
            >
                <SelectValue placeholder={t("menu.pickupTime")} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>{t("menu.pickupTime")}</SelectLabel>
                    {PICKUP_TIME_OPTIONS.map((minutes) => (
                        <SelectItem key={minutes} value={minutes.toString()}>
                            {minutes === 0
                                ? t("menu.immediately")
                                : `${minutes} ${t("menu.minutes")}`}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
