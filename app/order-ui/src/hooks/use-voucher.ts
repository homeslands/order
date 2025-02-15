import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import {
  createVoucher,
  deleteVoucher,
  getVoucherBySlug,
  getVouchers,
  updateVoucher,
  validateVoucher,
} from '@/api'
import { QUERYKEY } from '@/constants'
import {
  ICreateVoucherRequest,
  IGetVoucherBySlugRequest,
  IUpdateVoucherRequest,
  IValidateVoucherRequest,
} from '@/types'

export const useVouchers = () => {
  return useQuery({
    queryKey: [QUERYKEY.vouchers],
    queryFn: () => getVouchers(),
    placeholderData: keepPreviousData,
  })
}

export const useVoucherBySlug = (data: IGetVoucherBySlugRequest) => {
  return useQuery({
    queryKey: [QUERYKEY.vouchers, data.slug],
    queryFn: () => getVoucherBySlug(data),
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

export const useValidateVoucher = () => {
  return useMutation({
    mutationFn: async (data: IValidateVoucherRequest) => {
      return validateVoucher(data)
    },
  })
}
