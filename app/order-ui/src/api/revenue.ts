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

export async function getLatestRevenue(): Promise<IApiResponse<IRevenue[]>> {
  const response = await http.patch<IApiResponse<IRevenue[]>>('/revenue/latest')
  return response.data
}

export async function getLatestRevenueForARange(
  params: IRevenueQuery,
): Promise<IApiResponse<IRevenue[]>> {
  const response = await http.patch<IApiResponse<IRevenue[]>>('/revenue/date', {
    params,
  })
  return response.data
}

export async function getLatestBranchRevenue(
  q: string,
): Promise<IApiResponse<IBranchRevenue[]>> {
  const response = await http.patch<IApiResponse<IBranchRevenue[]>>(
    `/revenue/branch/latest`,
    {
      params: q,
    },
  )
  return response.data
}

export async function getLatestBranchRevenueForARange(
  params: IBranchRevenueQuery,
): Promise<IApiResponse<IBranchRevenue[]>> {
  const response = await http.patch<IApiResponse<IBranchRevenue[]>>(
    `/revenue/branch/date/${params.branch}`,
    {
      params,
    },
  )
  return response.data
}
