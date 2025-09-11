import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import {
  applyLoyaltyPoint,
  cancelReservationForOrder,
  getLoyaltyPointHistory,
  getLoyaltyPoints,
} from '@/api'
import { QUERYKEY } from '@/constants'
import { ILoyaltyPointHistoryQuery } from '@/types'

export const useLoyaltyPoints = (q?: string) => {
  return useQuery({
    queryKey: [QUERYKEY.loyaltyPoints, 'total', { slug: q || '' }],
    queryFn: () => getLoyaltyPoints(q as string),
    placeholderData: keepPreviousData,
    select: (data) => data.result,
    enabled: !!q,
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
    queryKey: [
      QUERYKEY.loyaltyPoints,
      'history',
      params.slug,
      params.page,
      params.size,
      params.fromDate,
      params.toDate,
      (params.types || []).join(','),
    ],
    queryFn: () => getLoyaltyPointHistory(params),
    placeholderData: keepPreviousData,
    select: (data) => data.result,
    enabled: !!params.slug,
  })
}
