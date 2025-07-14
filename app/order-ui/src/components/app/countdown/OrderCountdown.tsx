import { useEffect, useState } from 'react'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

import { useIsMobile } from '@/hooks'
import { usePaymentMethodStore } from '@/stores'

interface OrderCountdownProps {
    createdAt: string | undefined
    setIsExpired: (value: boolean) => void
}

export default function OrderCountdown({ createdAt, setIsExpired }: OrderCountdownProps) {
    const { t } = useTranslation('menu')
    const [timeRemainingInSec, setTimeRemainingInSec] = useState<number>(0)
    const [minutes, setMinutes] = useState(Math.floor(timeRemainingInSec / 60))
    const [seconds, setSeconds] = useState(timeRemainingInSec % 60)
    const { clearStore } = usePaymentMethodStore()
    // Trạng thái và vị trí cho kéo thả
    const [isDragging, setIsDragging] = useState(false)
    const [position, setPosition] = useState({ x: window.innerWidth - 350, y: 100, })
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const isMobile = useIsMobile()

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

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true)
        if (isMobile) document.body.style.overflow = 'hidden'
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
        setDragStart({ x: clientX - position.x, y: clientY - position.y })
    }

    const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
        if (isDragging) {
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
            // Giới hạn vị trí trong phạm vi màn hình
            const maxX = window.innerWidth - 350 // 300 là width của box
            const maxY = window.innerHeight - 40
            const newX = Math.min(Math.max(clientX - dragStart.x, 0), maxX)
            const newY = Math.min(Math.max(clientY - dragStart.y, 0), maxY)

            setPosition({ x: newX, y: newY })
        }
    }

    const handleDragEnd = () => {
        setIsDragging(false)
        document.body.style.overflow = 'auto'
    }

    return (
        <div className="fixed z-50 py-2 w-[320px] flex justify-center text-white rounded-md shadow-lg bg-primary select-none cursor-pointer"
            style={{ left: position.x, top: position.y }}
            onMouseDown={handleDragStart}
            onMouseMove={handleDrag}
            onMouseUp={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDrag}
            onTouchEnd={handleDragEnd}>
            {t('paymentMethod.timeRemaining')}{minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </div>
    )
}