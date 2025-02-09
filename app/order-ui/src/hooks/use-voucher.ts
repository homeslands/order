import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import {
  createVoucher,
  deleteVoucher,
  getVoucherBySlug,
  getVouchers,
  updateVoucher,
} from '@/api'
import { QUERYKEY } from '@/constants/query'
import { ICreateVoucherRequest, IUpdateVoucherRequest } from '@/types'

export const useVouchers = () => {
  return useQuery({
    queryKey: [QUERYKEY.vouchers],
    queryFn: () => getVouchers(),
    placeholderData: keepPreviousData,
  })
}

export const useVoucherBySlug = (slug: string) => {
  return useQuery({
    queryKey: [QUERYKEY.vouchers, slug],
    queryFn: () => getVoucherBySlug(slug),
  })
}

export const useCreateVoucher = () => {
  return useMutation({
    mutationFn: async (data: ICreateVoucherRequest) => {
      return createVoucher(data)
    },
  })
}

export const useUpdateVoucher = () => {
  return useMutation({
    mutationFn: async (data: IUpdateVoucherRequest) => {
      return updateVoucher(data)
    },
  })
}

export const useDeleteVoucher = () => {
  return useMutation({
    mutationFn: async (slug: string) => {
      return deleteVoucher(slug)
    },
  })
}
