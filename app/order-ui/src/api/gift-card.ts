import {
  IApiResponse,
  IGiftCard,
  IGiftCardCreateRequest,
  IGiftCardUpdateRequest,
  IPaginationResponse,
  IGetGiftCardsRequest,
  ICardOrderRequest,
  ICardOrderResponse,
  IGiftCardDetail,
  IUseGiftCardResponse,
  IUseGiftCardRequest,
  IGiftCardFlag,
  IGiftCardFlagFeature,
  IGiftCardGetRequest,
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

/**
 * Fetch a single gift card by slug
 * @param slug The slug of the gift card to fetch
 * @returns The gift card data
 */
export async function getGiftCard(
  slug: string,
): Promise<IApiResponse<IGiftCard>> {
  const response = await http.get<IApiResponse<IGiftCard>>(`/card/${slug}`, {
    // @ts-expect-error doNotShowLoading is not in AxiosRequestConfig
    doNotShowLoading: true,
  })
  return response.data as IApiResponse<IGiftCard>
}

/**
 * Get user gift cards with filters
 * @param params Query parameters including status, dates, pagination
 * @returns List of user gift cards
 */
export async function getUserGiftCards(
  params: IGiftCardGetRequest,
): Promise<IApiResponse<IPaginationResponse<IGiftCardDetail>>> {
  const response = await http.get<
    IApiResponse<IPaginationResponse<IGiftCardDetail>>
  >('/gift-card', {
    // @ts-expect-error doNotShowLoading is not in AxiosRequestConfig
    doNotShowLoading: true,
    params,
  })
  return response.data as IApiResponse<IPaginationResponse<IGiftCardDetail>>
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
  paymentMethod: string,
): Promise<IApiResponse<ICardOrderResponse>> {
  const response = await http.post(`/card-order/payment/initiate`, {
    cardorderSlug: slug,
    paymentMethod,
  })
  return response.data
}

export async function getGiftCardBySlug(
  slug: string,
): Promise<IApiResponse<IGiftCardDetail>> {
  const response = await http.get<IApiResponse<IGiftCardDetail>>(
    `/gift-card/${slug}`,
  )
  return response.data
}

export async function useGiftCard(
  params: IUseGiftCardRequest,
): Promise<IApiResponse<IUseGiftCardResponse>> {
  const response = await http.post<IApiResponse<IUseGiftCardResponse>>(
    '/gift-card/use',
    params,
  )
  return response.data
}

export async function getFeatureFlagsByGroup(
  group: string,
): Promise<IApiResponse<IGiftCardFlagFeature[]>> {
  const response = await http.get<IApiResponse<IGiftCardFlagFeature[]>>(
    `/feature-flag`,
    {
      params: { group },
    },
  )
  return response.data
}

export async function getFeatureFlagGroups(): Promise<
  IApiResponse<IGiftCardFlag>
> {
  const response =
    await http.get<IApiResponse<IGiftCardFlag>>(`/feature-flag/group`)
  return response.data
}

export async function bulkToggleFeatureFlags(
  updates: { slug: string; isLocked: boolean }[],
): Promise<void> {
  const response = await http.patch(`/feature-flag/bulk-toggle`, { updates })
  return response.data
}
