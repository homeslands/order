import {
  IAddressByPlaceId,
  IAddressSuggestion,
  IAddressDirection,
  IApiResponse,
  IDistanceAndDuration,
} from '@/types'
import { http } from '@/utils'

export async function getAddressSuggestions(
  address: string,
): Promise<IApiResponse<IAddressSuggestion[]>> {
  const safeAddress = encodeURIComponent(address) // <--- encode trước khi đưa vào URL

  const response = await http.get<IApiResponse<IAddressSuggestion[]>>(
    `/google-map/address/suggestion/${safeAddress}`,
    {
      // @ts-expect-error doNotShowLoading is not in AxiosRequestConfig
      doNotShowLoading: true,
    },
  )

  // @ts-expect-error doNotShowLoading is not in AxiosRequestConfig
  return response.data
}

export async function getAddressByPlaceId(
  placeId: string,
): Promise<IApiResponse<IAddressByPlaceId>> {
  const response = await http.get<IApiResponse<IAddressByPlaceId>>(
    `/google-map/location/place/${placeId}`,
    {
      // @ts-expect-error doNotShowLoading is not in AxiosRequestConfig
      doNotShowLoading: true,
    },
  )

  // @ts-expect-error doNotShowLoading is not in AxiosRequestConfig
  return response.data
}

export async function getAddressDirection(
  branch: string,
  lat: number,
  lng: number,
): Promise<IApiResponse<IAddressDirection>> {
  const response = await http.get<IApiResponse<IAddressDirection>>(
    `/google-map/direction`,
    {
      params: {
        branch,
        lat,
        lng,
      },
      // @ts-expect-error doNotShowLoading is not in AxiosRequestConfig
      doNotShowLoading: true,
    },
  )

  // @ts-expect-error doNotShowLoading is not in AxiosRequestConfig
  return response.data
}

export async function getDistanceAndDuration(
  branch: string,
  lat: number,
  lng: number,
): Promise<IApiResponse<IDistanceAndDuration>> {
  const response = await http.get<IApiResponse<IDistanceAndDuration>>(
    `/google-map/distance-and-duration`,
    {
      params: {
        branch,
        lat,
        lng,
      },
    },
  )

  return response.data
}
