import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import {
  applyVoucher,
  createMultipleVoucher,
  createVoucher,
  createVoucherGroup,
  deleteVoucher,
  deleteVoucherPaymentMethod,
  getPublicVouchersForOrder,
  getSpecificPublicVoucher,
  getSpecificVoucher,
  getVoucherGroups,
  getVouchers,
  getVouchersForOrder,
  removeAppliedVoucher,
  updateVoucher,
  updateVoucherGroup,
  updateVoucherPaymentMethod,
  validatePublicVoucher,
  validatePublicVoucherPaymentMethod,
  validateVoucher,
  validateVoucherPaymentMethod,
} from '@/api'
import { QUERYKEY } from '@/constants'
import {
  IApplyVoucherRequest,
  ICreateMultipleVoucherRequest,
  ICreateVoucherGroupRequest,
  ICreateVoucherRequest,
  IGetAllVoucherGroupRequest,
  IGetAllVoucherRequest,
  IGetSpecificVoucherRequest,
  IRemoveAppliedVoucherRequest,
  IUpdateVoucherGroupRequest,
  IUpdateVoucherPaymentMethodParamToRequest,
  IUpdateVoucherRequest,
  IValidateVoucherPaymentMethodRequest,
  IValidateVoucherRequest,
} from '@/types'

export const useVoucherGroups = (params?: IGetAllVoucherGroupRequest) => {
  return useQuery({
    queryKey: [QUERYKEY.voucherGroups, params],
    queryFn: () => getVoucherGroups(params),
    placeholderData: keepPreviousData,
    // enabled: !!params,
  })
}

export const useCreateVoucherGroup = () => {
  return useMutation({
    mutationFn: async (data: ICreateVoucherGroupRequest) => {
      return createVoucherGroup(data)
    },
  })
}

export const useUpdateVoucherGroup = () => {
  return useMutation({
    mutationFn: async (data: IUpdateVoucherGroupRequest) => {
      return updateVoucherGroup(data)
    },
  })
}

// vouchers for management
export const useVouchers = (params?: IGetAllVoucherRequest) => {
  return useQuery({
    queryKey: [QUERYKEY.vouchers, params],
    queryFn: () => getVouchers(params),
    placeholderData: keepPreviousData,
    enabled: !!params,
  })
}

// Vouchers for order
export const useVouchersForOrder = (
  params?: IGetAllVoucherRequest,
  enabled?: boolean,
) => {
  return useQuery({
    queryKey: [QUERYKEY.vouchersForOrder],
    queryFn: () => getVouchersForOrder(params),
    placeholderData: keepPreviousData,
    enabled: !!params && !!enabled,
  })
}
export const usePublicVouchersForOrder = (
  params?: IGetAllVoucherRequest,
  enabled?: boolean,
) => {
  return useQuery({
    queryKey: [QUERYKEY.vouchers],
    queryFn: () => getPublicVouchersForOrder(params),
    placeholderData: keepPreviousData,
    enabled: !!params && !!enabled,
  })
}
export const useSpecificVoucher = (data: IGetSpecificVoucherRequest) => {
  const enabled = Boolean(data?.code || data?.slug)
  return useQuery({
    queryKey: [QUERYKEY.specificVoucher, data],
    queryFn: () => getSpecificVoucher(data),
    enabled, // chỉ gọi khi có code hoặc slug
  })
}

export const useSpecificPublicVoucher = (data: IGetSpecificVoucherRequest) => {
  return useQuery({
    queryKey: [QUERYKEY.vouchers, data],
    queryFn: () => getSpecificPublicVoucher(data),
    enabled: !!data.code,
  })
}

export const useCreateVoucher = () => {
  return useMutation({
    mutationFn: async (data: ICreateVoucherRequest) => {
      return createVoucher(data)
    },
  })
}

export const useCreateMultipleVoucher = () => {
  return useMutation({
    mutationFn: async (data: ICreateMultipleVoucherRequest) => {
      return createMultipleVoucher(data)
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

export const useValidatePublicVoucher = () => {
  return useMutation({
    mutationFn: async (data: IValidateVoucherRequest) => {
      return validatePublicVoucher(data)
    },
  })
}

export const useValidateVoucherPaymentMethod = () => {
  return useMutation({
    mutationFn: async (data: IValidateVoucherPaymentMethodRequest) => {
      return validateVoucherPaymentMethod(data)
    },
  })
}

export const useValidatePublicVoucherPaymentMethod = () => {
  return useMutation({
    mutationFn: async (data: IValidateVoucherPaymentMethodRequest) => {
      return validatePublicVoucherPaymentMethod(data)
    },
  })
}

export const useApplyVoucher = () => {
  return useMutation({
    mutationFn: async (data: IApplyVoucherRequest) => {
      return applyVoucher(data)
    },
  })
}

export const useRemoveAppliedVoucher = () => {
  return useMutation({
    mutationFn: async (data: IRemoveAppliedVoucherRequest) => {
      return removeAppliedVoucher(data)
    },
  })
}

export const useUpdateVoucherPaymentMethod = () => {
  return useMutation({
    mutationFn: async (data: IUpdateVoucherPaymentMethodParamToRequest) => {
      return updateVoucherPaymentMethod(data)
    },
  })
}

export const useDeleteVoucherPaymentMethod = () => {
  return useMutation({
    mutationFn: async (data: IUpdateVoucherPaymentMethodParamToRequest) => {
      return deleteVoucherPaymentMethod(data)
    },
  })
}
