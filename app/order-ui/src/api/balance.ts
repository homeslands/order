import { IApiResponse, IBalanceResponse } from '@/types'
import { http } from '@/utils'

export async function getUserBalance(slug?: string, balance?: string): Promise<IApiResponse<IBalanceResponse>> {
  const url = balance ? `/balance?userSlug=${slug}&balance=${balance}` : `/balance?userSlug=${slug}`
  const response = await http.get<IApiResponse<IBalanceResponse>>(url)
  return response.data
}
