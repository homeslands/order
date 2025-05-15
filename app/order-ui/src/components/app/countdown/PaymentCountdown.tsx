import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface PaymentCountdownProps {
    timeRemaining: number
    // isExpired: boolean
}

export function PaymentCountdown({ timeRemaining }: PaymentCountdownProps) {
    const { t } = useTranslation('menu')
    const [minutes, setMinutes] = useState(Math.floor(timeRemaining / 60))
    const [seconds, setSeconds] = useState(timeRemaining % 60)

    useEffect(() => {
        setMinutes(Math.floor(timeRemaining / 60))
        setSeconds(timeRemaining % 60)
    }, [timeRemaining])

    // if (isExpired) {
    //     return (
    //         <div className="fixed px-4 py-2 text-white rounded-md shadow-lg top-4 right-4 bg-destructive">
    //             Hết hạn thanh toán
    //         </div>
    //     )
    // }

    return (
        <div className="fixed z-20 px-4 py-2 min-w-[13rem] text-white rounded-md shadow-lg top-20 right-4 bg-primary">
            {t('paymentMethod.timeRemaining')}{minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </div>
    )
}
