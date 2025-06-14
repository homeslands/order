import { useEffect, useState } from 'react'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

import { useIsMobile } from '@/hooks'
import { usePaymentMethodStore } from '@/stores'
import { orderExpirationTimeInSeconds } from '@/constants/env'

interface OrderCountdownProps {
  createdAt: string | undefined
  setIsExpired: (value: boolean) => void
}

export function OrderCountdown({
  createdAt,
  setIsExpired,
}: OrderCountdownProps) {
  const { t } = useTranslation('menu')
  const [timeRemainingInSec, setTimeRemainingInSec] = useState<number>(0)
  const [minutes, setMinutes] = useState(Math.floor(timeRemainingInSec / 60))
  const [seconds, setSeconds] = useState(timeRemainingInSec % 60)
  const { clearStore } = usePaymentMethodStore() // Trạng thái và vị trí cho kéo thả
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({
    x: window.innerWidth - 350,
    y: 100,
  })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const isMobile = useIsMobile()

  useEffect(() => {
    if (createdAt) {
      const createTime = moment(createdAt)
      const now = moment()
      const timePassed = now.diff(createTime, 'seconds')
      const remainingTime = orderExpirationTimeInSeconds - timePassed
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
    <div
      className="fixed z-20 flex w-[320px] cursor-pointer select-none justify-center rounded-md bg-primary py-2 text-white shadow-lg"
      style={{ left: position.x, top: position.y }}
      onMouseDown={handleDragStart}
      onMouseMove={handleDrag}
      onMouseUp={handleDragEnd}
      onTouchStart={handleDragStart}
      onTouchMove={handleDrag}
      onTouchEnd={handleDragEnd}
    >
      {t('paymentMethod.timeRemaining')}
      {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
    </div>
  )
}
