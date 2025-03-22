import { usePaymentMethodStore } from '@/stores'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface OrderCountdownProps {
    createdAt: string | undefined
    setIsExpired: (value: boolean) => void
}

export function OrderCountdown({ createdAt, setIsExpired }: OrderCountdownProps) {
    const { t } = useTranslation('menu')
    const [timeRemainingInSec, setTimeRemainingInSec] = useState<number>(0)
    const [minutes, setMinutes] = useState(Math.floor(timeRemainingInSec / 60))
    const [seconds, setSeconds] = useState(timeRemainingInSec % 60)
    const { clearStore } = usePaymentMethodStore()
    useEffect(() => {
        if (createdAt) {
            const createTime = moment(createdAt)
            const now = moment()
            const timePassed = now.diff(createTime, 'seconds')
            const remainingTime = 600 - timePassed // 10 minutes
            setTimeRemainingInSec(remainingTime > 0 ? remainingTime : 0)
            setIsExpired(remainingTime <= 0)
        }
    }, [createdAt, setIsExpired])

    useEffect(() => {
        let timerInterval: NodeJS.Timeout | null = null

        if (timeRemainingInSec > 0) {
            timerInterval = setInterval(() => {
                setTimeRemainingInSec((prev) => {
                    const newTime = prev - 1
                    if (newTime <= 0) {
                        setIsExpired(true)
                        clearStore()
                        if (timerInterval) clearInterval(timerInterval)
                    }
                    return newTime
                })
            }, 1000)
        }

        return () => {
            if (timerInterval) clearInterval(timerInterval)
        }
    }, [timeRemainingInSec, clearStore, setIsExpired])

    useEffect(() => {
        setMinutes(Math.floor(timeRemainingInSec / 60))
        setSeconds(timeRemainingInSec % 60)
    }, [timeRemainingInSec])

    return (
        <div className="fixed z-20 px-4 py-2 min-w-[13rem] text-white rounded-md shadow-lg top-20 right-4 bg-primary">
            {t('paymentMethod.timeRemaining')}{minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </div>
    )
}
