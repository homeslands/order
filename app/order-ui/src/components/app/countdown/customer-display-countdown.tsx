import { useEffect, useState } from 'react'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

import { usePaymentMethodStore } from '@/stores'

interface CustomerDisplayCountdownProps {
    createdAt: string | undefined
    setIsExpired: (value: boolean) => void
}

export default function CustomerDisplayCountdown({ createdAt, setIsExpired }: CustomerDisplayCountdownProps) {
    const { t } = useTranslation('menu')
    const [timeRemainingInSec, setTimeRemainingInSec] = useState<number>(0)
    const [minutes, setMinutes] = useState(Math.floor(timeRemainingInSec / 60))
    const [seconds, setSeconds] = useState(timeRemainingInSec % 60)
    const { clearStore } = usePaymentMethodStore()

    useEffect(() => {
        let timerInterval: NodeJS.Timeout | null = null;

        if (createdAt) {
            timerInterval = setInterval(() => {
                const createTime = moment(createdAt);
                const now = moment();
                const timePassed = now.diff(createTime, 'seconds');
                const remainingTime = 900 - timePassed;

                if (remainingTime <= 0) {
                    setTimeRemainingInSec(0);
                    setIsExpired(true);
                    clearStore();
                    if (timerInterval) clearInterval(timerInterval);
                } else {
                    setTimeRemainingInSec(remainingTime);
                }
            }, 1000);
        }

        return () => {
            if (timerInterval) clearInterval(timerInterval);
        };
    }, [createdAt, clearStore, setIsExpired]);


    useEffect(() => {
        setMinutes(Math.floor(timeRemainingInSec / 60))
        setSeconds(timeRemainingInSec % 60)
    }, [timeRemainingInSec])

    return (
        <div className="flex justify-center p-2 text-sm text-white rounded-lg bg-primary">
            {t('paymentMethod.timeRemaining')}{minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </div>
    )
}
