import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import {
  applyLoyaltyPoint,
  cancelReservationForOrder,
  getLoyaltyPointHistory,
  getLoyaltyPoints,
} from '@/api'
import { QUERYKEY } from '@/constants'
import { ILoyaltyPointHistoryQuery } from '@/types'

export const useLoyaltyPoints = (q: string) => {
  return useQuery({
    queryKey: [QUERYKEY.loyaltyPoints, q],
    queryFn: () => getLoyaltyPoints(q),
    placeholderData: keepPreviousData,
    select: (data) => data.result,
  })
}

export const useApplyLoyaltyPoint = () => {
  return useMutation({
    mutationFn: async ({
      orderSlug,
      pointsToUse,
    }: {
      orderSlug: string
      pointsToUse: number
    }) => applyLoyaltyPoint(orderSlug, pointsToUse),
  })
}

export const useCancelReservationForOrder = () => {
  return useMutation({
    mutationFn: async (orderSlug: string) =>
      cancelReservationForOrder(orderSlug),
  })
}

export const useLoyaltyPointHistory = (params: ILoyaltyPointHistoryQuery) => {
  return useQuery({
    queryKey: [QUERYKEY.loyaltyPoints, params.slug],
    queryFn: () => getLoyaltyPointHistory(params),
    placeholderData: keepPreviousData,
    select: (data) => data.result,
  })
}
