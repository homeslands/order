import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import {
  getAllRevenue,
  getLatestRevenue,
  getLatestBranchRevenueForARange,
  getLatestRevenueForARange,
  getRevenue,
  getBranchRevenue,
  exportExcelRevenue,
  exportPDFRevenue,
} from '@/api'
import { IAllRevenueQuery, IBranchRevenueQuery, IRevenueQuery } from '@/types'
import { QUERYKEY } from '@/constants'

export const useRevenue = (q: IRevenueQuery) => {
  return useQuery({
    queryKey: [QUERYKEY.revenue, JSON.stringify(q)],
    queryFn: () => getRevenue(q),
    placeholderData: keepPreviousData,
  })
}

export const useAllRevenue = (q: IAllRevenueQuery) => {
  return useQuery({
    queryKey: ['allRevenue', JSON.stringify(q)],
    queryFn: () => getAllRevenue(q),
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

export const useLatestRevenueForARange = (q: IRevenueQuery) => {
  return useMutation({
    mutationFn: async () => {
      return getLatestRevenueForARange(q)
    },
  })
}

export const useLatestRevenue = () => {
  return useMutation({
    mutationFn: async () => {
      return getLatestRevenue()
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

export const useExportExcelRevenue = () => {
  return useMutation({
    mutationFn: async (q: IRevenueQuery) => {
      return exportExcelRevenue(q)
    },
  })
}

export const useExportPDFRevenue = () => {
  return useMutation({
    mutationFn: async (q: IRevenueQuery) => {
      return exportPDFRevenue(q)
    },
  })
}
