import { IAllNotificationRequest, IApiResponse, INotification } from '@/types'
import { http } from '@/utils'

export async function getAllNotifications(
  params: IAllNotificationRequest,
): Promise<IApiResponse<INotification[]>> {
  const response = await http.get<IApiResponse<INotification[]>>(
    '/notification',
    {
      params,
    },
  )
  return response.data
}

export async function updateNotificationStatus(
  slug: string,
): Promise<IApiResponse<INotification>> {
  const response = await http.patch<IApiResponse<INotification>>(
    `/notification/${slug}/read`,
  )
  if (!response || !response.data) throw new Error('No data found')
  return response.data
}
