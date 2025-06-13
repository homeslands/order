import {
  IApiResponse,
  IGiftCard,
  IGiftCardCreateRequest,
  IGiftCardUpdateRequest,
  IPaginationResponse,
  IGetGiftCardsRequest,
  ICardOrderRequest,
  ICardOrderResponse,
} from '@/types'
import { http } from '@/utils'

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

export async function createCardOrder(
  data: ICardOrderRequest,
): Promise<IApiResponse<ICardOrderResponse>> {
  const response = await http.post('/card-order', data)
  return response.data
}

export async function getCardOrder(
  slug: string,
): Promise<IApiResponse<ICardOrderResponse>> {
  const response = await http.get(`/card-order/${slug}`)
  return response.data
}

export async function cancelCardOrder(slug: string): Promise<void> {
  await http.post(`/card-order/${slug}/cancel`)
}

export async function initiateCardOrderPayment(
  slug: string,
): Promise<IApiResponse<ICardOrderResponse>> {
  const response = await http.post(`/card-order/payment/initiate`, {
    cardorderSlug: slug,
  })
  return response.data
}
