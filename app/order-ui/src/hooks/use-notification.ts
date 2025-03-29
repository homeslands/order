import { getAllNotifications, updateNotificationStatus } from '@/api'
import { QUERYKEY } from '@/constants'
import { IAllNotificationRequest } from '@/types'
import { useQuery, useMutation, keepPreviousData } from '@tanstack/react-query'

export const useNotification = (params: IAllNotificationRequest) => {
  return useQuery({
    queryKey: [QUERYKEY.notifications, params],
    queryFn: async () => getAllNotifications(params),
    placeholderData: keepPreviousData,
  })
}

export const useUpdateNotificationStatus = () => {
  return useMutation({
    mutationFn: async (slug: string) => {
      return updateNotificationStatus(slug)
    },
  })
}
