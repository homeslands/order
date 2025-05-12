import {
  IApiResponse,
  ICreateMultipleVoucherRequest,
  ICreateVoucherGroupRequest,
  ICreateVoucherRequest,
  IGetAllVoucherRequest,
  IGetSpecificVoucherRequest,
  IPaginationResponse,
  IUpdateVoucherGroupRequest,
  IUpdateVoucherRequest,
  IValidateVoucherRequest,
  IVoucher,
  IVoucherGroup,
} from '@/types'
import { http } from '@/utils'

export async function getVoucherGroups(
  params?: IGetAllVoucherRequest,
): Promise<IApiResponse<IPaginationResponse<IVoucherGroup>>> {
  const response = await http.get<
    IApiResponse<IPaginationResponse<IVoucherGroup>>
  >('/voucher-group', {
    params,
  })
  return response.data
}

export async function createVoucherGroup(
  data: ICreateVoucherGroupRequest,
): Promise<IApiResponse<IVoucherGroup>> {
  const response = await http.post<IApiResponse<IVoucherGroup>>(
    '/voucher-group',
    data,
  )
  return response.data
}

export async function updateVoucherGroup(
  data: IUpdateVoucherGroupRequest,
): Promise<IApiResponse<IVoucherGroup>> {
  const response = await http.patch<IApiResponse<IVoucherGroup>>(
    `/voucher-group/${data.slug}`,
    data,
  )
  return response.data
}

// voucher list for management
export async function getVouchers(
  params?: IGetAllVoucherRequest,
): Promise<IApiResponse<IPaginationResponse<IVoucher>>> {
  const response = await http.get<IApiResponse<IPaginationResponse<IVoucher>>>(
    '/voucher',
    {
      params,
    },
  )
  return response.data
}

// voucher list for order
export async function getVouchersForOrder(
  params?: IGetAllVoucherRequest,
): Promise<IApiResponse<IPaginationResponse<IVoucher>>> {
  const response = await http.get<IApiResponse<IPaginationResponse<IVoucher>>>(
    '/voucher/order',
    {
      params,
    },
  )
  return response.data
}

export async function getPublicVouchersForOrder(
  params?: IGetAllVoucherRequest,
): Promise<IApiResponse<IPaginationResponse<IVoucher>>> {
  const response = await http.get<IApiResponse<IPaginationResponse<IVoucher>>>(
    '/voucher/order/public',
    {
      params,
    },
  )
  return response.data
}

export async function getSpecificVoucher(
  param: IGetSpecificVoucherRequest,
): Promise<IApiResponse<IVoucher>> {
  const response = await http.get<IApiResponse<IVoucher>>(`/voucher/specific`, {
    params: param,
  })
  return response.data
}

export async function getSpecificPublicVoucher(
  param: IGetSpecificVoucherRequest,
): Promise<IApiResponse<IVoucher>> {
  const response = await http.get<IApiResponse<IVoucher>>(
    `/voucher/specific/public`,
    {
      params: param,
    },
  )
  return response.data
}

export async function createVoucher(
  data: ICreateVoucherRequest,
): Promise<IApiResponse<IVoucher>> {
  const response = await http.post<IApiResponse<IVoucher>>('/voucher', data)
  return response.data
}

export async function createMultipleVoucher(
  data: ICreateMultipleVoucherRequest,
): Promise<IApiResponse<IVoucher>> {
  const response = await http.post<IApiResponse<IVoucher>>(
    '/voucher/bulk',
    data,
  )
  return response.data
}

export async function updateVoucher(
  data: IUpdateVoucherRequest,
): Promise<IApiResponse<IVoucher>> {
  const response = await http.patch<IApiResponse<IVoucher>>(
    `/voucher/${data.slug}`,
    data,
  )
  return response.data
}

export async function deleteVoucher(slug: string): Promise<IApiResponse<null>> {
  const response = await http.delete<IApiResponse<null>>(`/voucher/${slug}`)
  return response.data
}

export async function validateVoucher(
  data: IValidateVoucherRequest,
): Promise<IApiResponse<IVoucher>> {
  const response = await http.post<IApiResponse<IVoucher>>(
    '/voucher/validate',
    data,
  )
  return response.data
}

export async function validatePublicVoucher(
  data: IValidateVoucherRequest,
): Promise<IApiResponse<IVoucher>> {
  const response = await http.post<IApiResponse<IVoucher>>(
    '/voucher/validate/public',
    data,
  )
  return response.data
}
