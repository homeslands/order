import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import {
  getBranchRevenue,
  getLatestBranchRevenue,
  getLatestBranchRevenueForARange,
  getLatestRevenue,
  getLatestRevenueForARange,
  getRevenue,
} from '@/api'
import { IBranchRevenueQuery, IRevenueQuery } from '@/types'

export const useRevenue = (q: IRevenueQuery) => {
  return useQuery({
    queryKey: ['revenue', JSON.stringify(q)],
    queryFn: () => getRevenue(q),
    placeholderData: keepPreviousData,
  })
}

export const useBranchRevenue = (q: IBranchRevenueQuery) => {
  return useQuery({
    queryKey: ['branchRevenue', JSON.stringify(q)],
    queryFn: () => getBranchRevenue(q),
    placeholderData: keepPreviousData,
  })
}

export const useLatestRevenue = () => {
  return useMutation({
    mutationFn: async () => {
      return getLatestRevenue()
    },
  })
}

export const useLatestRevenueForARange = (q: IRevenueQuery) => {
  return useMutation({
    mutationFn: async () => {
      return getLatestRevenueForARange(q)
    },
  })
}

export const useLatestBranchRevenue = () => {
  return useMutation({
    mutationFn: async (q: string) => {
      return getLatestBranchRevenue(q)
    },
  })
}

export const useLatestBranchRevenueForARange = (q: IBranchRevenueQuery) => {
  return useMutation({
    mutationFn: async () => {
      return getLatestBranchRevenueForARange(q)
    },
  })
}
