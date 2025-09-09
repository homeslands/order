import {
  IApiResponse,
  ILoyaltyPoint,
  ILoyaltyPointHistory,
  ILoyaltyPointHistoryQuery,
  IPaginationResponse,
  IUseLoyaltyPointResponse,
} from '@/types'
import { http } from '@/utils'

export async function getLoyaltyPoints(
  userSlug?: string,
): Promise<IApiResponse<ILoyaltyPoint>> {
  const response = await http.get<IApiResponse<ILoyaltyPoint>>(
    `/accumulated-point/user/${userSlug}/points`,
  )
  return response.data
}

export async function applyLoyaltyPoint(
  orderSlug?: string,
  pointsToUse?: number,
): Promise<IApiResponse<IUseLoyaltyPointResponse>> {
  const response = await http.post<IApiResponse<IUseLoyaltyPointResponse>>(
    `/accumulated-point/order/${orderSlug}/apply-points`,
    {
      pointsToUse,
    },
  )
  return response.data
}

export async function cancelReservationForOrder(
  orderSlug: string,
): Promise<IApiResponse<void>> {
  const response = await http.post<IApiResponse<void>>(
    `/accumulated-point/order/${orderSlug}/cancel-reservation`,
  )
  return response.data
}

export async function getLoyaltyPointHistory(
  params: ILoyaltyPointHistoryQuery,
): Promise<IApiResponse<IPaginationResponse<ILoyaltyPointHistory>>> {
  const { slug, ...rest } = params
  const response = await http.get<
    IApiResponse<IPaginationResponse<ILoyaltyPointHistory>>
  >(`/accumulated-point/user/${slug}/history`, {
    params: rest,
    paramsSerializer: {
      indexes: null, // bỏ "[]"
    },
  })
  return response.data
}
