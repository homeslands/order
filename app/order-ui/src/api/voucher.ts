import {
  IApiResponse,
  ICreateVoucherRequest,
  IUpdateVoucherRequest,
  IVoucher,
} from '@/types'
import { http } from '@/utils'

export async function getVouchers(): Promise<IApiResponse<IVoucher[]>> {
  const response = await http.get<IApiResponse<IVoucher[]>>('/voucher')
  return response.data
}

export async function getVoucherBySlug(
  slug: string,
): Promise<IApiResponse<IVoucher>> {
  const response = await http.get<IApiResponse<IVoucher>>(`/voucher/${slug}`)
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
