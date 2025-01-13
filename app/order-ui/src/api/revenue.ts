import { http } from '@/utils'
import {
  IApiResponse,
  IBranchRevenue,
  IBranchRevenueQuery,
  IRevenue,
  IRevenueQuery,
} from '@/types'

export async function getRevenue(
  params: IRevenueQuery,
): Promise<IApiResponse<IRevenue[]>> {
  const response = await http.get<IApiResponse<IRevenue[]>>('/revenue', {
    params,
  })
  return response.data
}

export async function getBranchRevenue(
  params: IBranchRevenueQuery,
): Promise<IApiResponse<IBranchRevenue[]>> {
  const response = await http.get<IApiResponse<IBranchRevenue[]>>(
    `/revenue/branch/${params.branch}`,
    {
      params,
    },
  )
  return response.data
}
