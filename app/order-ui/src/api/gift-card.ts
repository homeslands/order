import {
  IApiResponse,
  IGiftCard,
  IGiftCardCreateRequest,
  IGiftCardUpdateRequest,
  IPaginationResponse,
} from '@/types'
import { http } from '@/utils'

export interface IGetGiftCardsRequest {
  page?: number
  size?: number
  sort?: string
  isActive?: boolean
}

export async function getGiftCards(
  params: IGetGiftCardsRequest,
): Promise<IApiResponse<IPaginationResponse<IGiftCard>>> {
  const response = await http.get<IApiResponse<IPaginationResponse<IGiftCard>>>(
    '/card',
    {
      // @ts-expect-error doNotShowLoading is not in AxiosRequestConfig
      doNotShowLoading: true,
      params,
    },
  )
  return response.data as IApiResponse<IPaginationResponse<IGiftCard>>
}

export async function createGiftCard(
  data: IGiftCardCreateRequest,
): Promise<IApiResponse<IGiftCard>> {
  const response = await http.post('/card', data)
  return response.data
}

export async function updateGiftCard(
  data: IGiftCardUpdateRequest,
  slug: string,
): Promise<IApiResponse<IGiftCard>> {
  const response = await http.patch(`/card/${slug}`, data)
  return response.data
}

export async function deleteGiftCard(slug: string): Promise<void> {
  await http.delete(`/card/${slug}`)
}
