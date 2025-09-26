import { useQuery } from '@tanstack/react-query'

import {
  getAddressByPlaceId,
  getAddressDirection,
  getAddressSuggestions,
  getDistanceAndDuration,
} from '@/api'
import { QUERYKEY } from '@/constants'

export const useGetAddressSuggestions = (address: string) => {
  return useQuery({
    queryKey: [QUERYKEY.addressSuggestions, address],
    queryFn: () => getAddressSuggestions(address),
    enabled: !!address,
  })
}

export const useGetAddressByPlaceId = (placeId: string) => {
  return useQuery({
    queryKey: [QUERYKEY.addressByPlaceId, placeId],
    queryFn: () => getAddressByPlaceId(placeId),
    enabled: !!placeId,
  })
}

export const useGetAddressDirection = (
  branch: string,
  lat: number,
  lng: number,
) => {
  return useQuery({
    queryKey: [QUERYKEY.addressDirection, branch, lat, lng],
    queryFn: () => getAddressDirection(branch, lat, lng),
    enabled: !!branch && !!lat && !!lng,
  })
}

export const useGetDistanceAndDuration = (
  branch: string,
  lat: number,
  lng: number,
) => {
  return useQuery({
    queryKey: [QUERYKEY.distanceAndDuration, branch, lat, lng],
    queryFn: () => getDistanceAndDuration(branch, lat, lng),
    enabled: !!branch && !!lat && !!lng,
  })
}
