import {
  applyPromotion,
  createPromotion,
  deletePromotion,
  getPromotions,
  removeProductPromotion,
  updatePromotion,
} from '@/api'
import { QUERYKEY } from '@/constants'
import {
  IApplyPromotionRequest,
  ICreatePromotionRequest,
  IRemoveAppliedPromotionRequest,
  IUpdatePromotionRequest,
} from '@/types'
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

export const usePromotions = (branchSlug: string) => {
  return useQuery({
    queryKey: [QUERYKEY.promotions, branchSlug],
    queryFn: () => getPromotions(branchSlug),
    placeholderData: keepPreviousData,
  })
}

export const useCreatePromotion = () => {
  return useMutation({
    mutationFn: async (data: ICreatePromotionRequest) => {
      return createPromotion(data)
    },
  })
}

export const useUpdatePromotion = () => {
  return useMutation({
    mutationFn: async (data: IUpdatePromotionRequest) => {
      return updatePromotion(data)
    },
  })
}

export const useDeletePromotion = () => {
  return useMutation({
    mutationFn: async (slug: string) => {
      return deletePromotion(slug)
    },
  })
}

export const useApplyPromotion = () => {
  return useMutation({
    mutationFn: async (data: IApplyPromotionRequest) => {
      return applyPromotion(data)
    },
  })
}

export const useRemoveAppliedPromotion = () => {
  return useMutation({
    mutationFn: async (data: IRemoveAppliedPromotionRequest) => {
      return removeProductPromotion(data)
    },
  })
}
