import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import {
  createVoucher,
  deleteVoucher,
  getSpecificVoucher,
  getVouchers,
  updateVoucher,
  validateVoucher,
} from '@/api'
import { QUERYKEY } from '@/constants'
import {
  ICreateVoucherRequest,
  IGetAllVoucherRequest,
  IGetSpecificVoucherRequest,
  IUpdateVoucherRequest,
  IValidateVoucherRequest,
} from '@/types'

export const useVouchers = (params: IGetAllVoucherRequest) => {
  return useQuery({
    queryKey: [QUERYKEY.vouchers],
    queryFn: () => getVouchers(params),
    placeholderData: keepPreviousData,
  })
}

export const useSpecificVoucher = (data: IGetSpecificVoucherRequest) => {
  return useQuery({
    queryKey: [QUERYKEY.vouchers, data],
    queryFn: () => getSpecificVoucher(data),
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
