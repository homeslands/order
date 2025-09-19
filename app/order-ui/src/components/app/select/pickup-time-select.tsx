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
    defaultValue?: number
    onPickupTimeSelect?: (minutes: number) => void
}

const PICKUP_TIME_OPTIONS = [0, 5, 10, 15, 30, 45, 60]

export default function PickupTimeSelect({
    defaultValue,
    onPickupTimeSelect,
}: IPickupTimeSelectProps) {
    const { t } = useTranslation("menu")
    const { getCartItems, addPickupTime } = useOrderFlowStore()

    const [selectedTime, setSelectedTime] = useState<string>("0") // mặc định = 0 (immediately)

    const cartItems = getCartItems()

    useEffect(() => {
        if (defaultValue !== undefined) {
            setSelectedTime(defaultValue.toString())
        } else if (cartItems?.timeLeftTakeOut !== undefined) {
            setSelectedTime(cartItems.timeLeftTakeOut.toString())
        } else {
            // nếu không có defaultValue và cart chưa có time thì set = 0
            setSelectedTime("0")
            addPickupTime(0)
        }
    }, [defaultValue, cartItems?.timeLeftTakeOut, addPickupTime])

    // Nếu không phải đơn mang đi thì không render
    if (cartItems?.type !== OrderTypeEnum.TAKE_OUT) {
        return null
    }

    const handlePickupTimeSelect = (value: string) => {
        const minutes = parseInt(value, 10)
        setSelectedTime(value)
        addPickupTime(minutes)
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
