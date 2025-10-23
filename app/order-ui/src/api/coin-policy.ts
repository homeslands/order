import {
  IApiResponse,
} from '@/types'
import { ICoinPolicy, IToggleCoinPolicy, IUpdateCoinPolicy } from '@/types/coin-policy.type'
import { http } from '@/utils'

const resourceUrl = '/coin-policy'

export async function getCoinPoliciesApi(): Promise<
  IApiResponse<ICoinPolicy[]>
> {
  const response =
    await http.get<IApiResponse<ICoinPolicy[]>>(resourceUrl)
  return response.data
}


export async function updateCoinPolicyApi(request: { slug: string, payload: IUpdateCoinPolicy }) {
  const response =
    await http.patch<void>(`${resourceUrl}/${request.slug}`, request.payload)
  return response.data
}


export async function toggleCoinPolicyApi(request: { slug: string, payload: IToggleCoinPolicy }) {
  const response =
    await http.patch<void>(`${resourceUrl}/${request.slug}/activation`, request.payload)
  return response.data
}

