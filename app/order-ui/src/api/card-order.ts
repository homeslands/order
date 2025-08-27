import { ICardOrderGetRequest, ICardOrderResponse } from '@/types'
import { IPaginationResponse, IApiResponse } from '@/types'
import { http } from '@/utils'

export const getCardOrders = async (
  params?: ICardOrderGetRequest,
): Promise<IApiResponse<IPaginationResponse<ICardOrderResponse>>> => {
  const response = await http.get<
    IApiResponse<IPaginationResponse<ICardOrderResponse>>
  >('/card-order', {
    // @ts-expect-error doNotShowLoading is not in AxiosRequestConfig
    doNotShowLoading: true,
    params,
  })
  return response.data as IApiResponse<IPaginationResponse<ICardOrderResponse>>
}
