import { getAllNotifications, registerDeviceToken, unregisterDeviceToken, updateNotificationStatus } from '@/api'
import { QUERYKEY } from '@/constants'
import { IAllNotificationRequest, IRegisterDeviceTokenRequest } from '@/types'
import { useInfiniteQuery, useMutation } from '@tanstack/react-query'

export const useNotification = (params: IAllNotificationRequest) => {
  return useInfiniteQuery({
    queryKey: [QUERYKEY.notifications, params],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getAllNotifications({ ...params, page: pageParam })
      return response
    },
    getNextPageParam: (lastPage) => {
      const { hasNext, page, totalPages } = lastPage.result
      if (hasNext && page < totalPages) {
        return page + 1
      }
      return undefined
    },
    initialPageParam: 1,
  })
}

export const useUpdateNotificationStatus = () => {
  return useMutation({
    mutationFn: async (slug: string) => {
      return updateNotificationStatus(slug)
    },
  })
}

export const useRegisterDeviceToken = () => {
  return useMutation({
    mutationFn: async (params: IRegisterDeviceTokenRequest) => {
      return registerDeviceToken(params)
    },
  })
}

export const useUnregisterDeviceToken = () => {
  return useMutation({
    mutationFn: async (token: string) => {
      return unregisterDeviceToken(token)
    },
  })
}