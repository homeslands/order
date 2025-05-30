import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface CountdownTimerProps {
    startTime: number | string // timestamp in milliseconds or ISO string
    duration: number // duration in minutes
    onExpired?: () => void
    className?: string
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
    startTime,
    duration,
    onExpired,
    className
}) => {
    const { t } = useTranslation(['profile'])
    const [timeLeft, setTimeLeft] = useState(0)

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = Date.now()
            // Convert startTime to number if it's a string
            const startTimeMs = typeof startTime === 'string' ? new Date(startTime).getTime() : startTime
            const endTime = startTimeMs + (duration * 60 * 1000) // Convert minutes to milliseconds
            const remaining = Math.max(0, endTime - now)

            // Subtract 1 minute (60000ms) as buffer to account for network delays
            const bufferedRemaining = Math.max(0, remaining - 30000) // 30 seconds buffer
            return bufferedRemaining
        }

        const updateTimer = () => {
            const remaining = calculateTimeLeft()
            setTimeLeft(remaining)

            if (remaining === 0 && onExpired) {
                onExpired()
            }
        }

        // Initial calculation
        updateTimer()

        // Update every second
        const interval = setInterval(updateTimer, 1000)

        return () => clearInterval(interval)
    }, [startTime, duration, onExpired])

    const formatTime = (milliseconds: number) => {
        const totalSeconds = Math.floor(milliseconds / 1000)
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60

        return {
            minutes,
            seconds: seconds.toString().padStart(2, '0')
        }
    }

    const { minutes, seconds } = formatTime(timeLeft)

    if (timeLeft === 0) {
        return null
    }

    return (
        <div className={cn('text-sm text-center text-muted-foreground', className)}>
            {t('profile.otpExpiredIn')}: {minutes}:{seconds}
        </div>
    )
}

CountdownTimer.displayName = 'CountdownTimer' 