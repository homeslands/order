import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { getCardOrder } from '@/api'
import { QUERYKEY } from '@/constants'
import { ICardOrderResponse, IApiResponse, OrderStatus } from '@/types'

interface UseGiftCardPollingProps {
  slug: string
  shouldPoll: boolean
  pollingInterval?: number
  onPaymentSuccess?: () => void
  onExpired?: () => void
  onCancelled?: () => void
}

export function useGiftCardPolling({
  slug,
  shouldPoll,
  pollingInterval = 30000, // 30 seconds default
  onPaymentSuccess,
  onExpired,
}: UseGiftCardPollingProps) {
  const [isPolling, setIsPolling] = useState(shouldPoll)
  const [pollAttempts, setPollAttempts] = useState(0)
  const query = useQuery({
    queryKey: [QUERYKEY.cardOrder, slug, 'polling'],
    queryFn: () => getCardOrder(slug),
    refetchInterval: (data) => {
      // Stop polling if payment is completed or if we're not supposed to poll
      if (!isPolling) return false

      // Cast data properly - it's IApiResponse<ICardOrderResponse>
      const response = data as unknown as IApiResponse<ICardOrderResponse>
      const cardOrder = response?.result // Check if payment is completed
      if (cardOrder?.paymentStatus === OrderStatus.COMPLETED) {
        setIsPolling(false)
        onPaymentSuccess?.()
        return false
      }

      // Use fixed polling interval
      return pollingInterval
    },
    enabled: !!slug && isPolling,
  })

  // Handle errors separately using useEffect
  useEffect(() => {
    if (query.error && isPolling) {
      setIsPolling(false)
    }
  }, [query.error, isPolling])

  // Update polling state when shouldPoll changes
  useEffect(() => {
    setIsPolling(shouldPoll)
    if (shouldPoll) {
      setPollAttempts(0) // Reset attempts when starting fresh
    }
  }, [shouldPoll])
  // Stop polling when payment expires
  useEffect(() => {
    const response = query.data as unknown as IApiResponse<ICardOrderResponse>
    const cardOrder = response?.result

    if (cardOrder) {
      const orderDate = new Date(cardOrder.orderDate)
      const expiryDate = new Date(orderDate.getTime() + 15 * 60 * 1000) // 15 minutes
      const now = new Date()

      if (now > expiryDate) {
        setIsPolling(false)
        onExpired?.()
      }
    }
  }, [query.data, onExpired])

  const startPolling = () => {
    setIsPolling(true)
    setPollAttempts(0)
  }

  const stopPolling = () => {
    setIsPolling(false)
  }

  return {
    ...query,
    isPolling,
    startPolling,
    stopPolling,
    pollAttempts,
  }
}
