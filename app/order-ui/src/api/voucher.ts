import {
  IApiResponse,
  ICreateVoucherRequest,
  IGetAllVoucherRequest,
  IGetSpecificVoucherRequest,
  IUpdateVoucherRequest,
  IValidateVoucherRequest,
  IVoucher,
} from '@/types'
import { http } from '@/utils'

export async function getVouchers(
  params?: IGetAllVoucherRequest,
): Promise<IApiResponse<IVoucher[]>> {
  const response = await http.get<IApiResponse<IVoucher[]>>('/voucher', {
    params,
  })
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

export async function createVoucher(
  data: ICreateVoucherRequest,
): Promise<IApiResponse<IVoucher>> {
  const response = await http.post<IApiResponse<IVoucher>>('/voucher', data)
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
