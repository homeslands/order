import {
  IAllNotificationRequest,
  IApiResponse,
  INotification,
  IPaginationResponse,
  IRegisterDeviceTokenRequest,
  IRegisterDeviceTokenResponse,
} from '@/types'
import { http } from '@/utils'

export async function getAllNotifications(
  params: IAllNotificationRequest,
): Promise<IApiResponse<IPaginationResponse<INotification>>> {
  const response = await http.get<
    IApiResponse<IPaginationResponse<INotification>>
  >('/notification', {
    // @ts-expect-error doNotShowLoading is not in AxiosRequestConfig
    doNotShowLoading: true,
    params,
  })
  // @ts-expect-error doNotShowLoading is not in AxiosRequestConfig
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

// Đăng ký token FCM
export async function registerDeviceToken(params: IRegisterDeviceTokenRequest): Promise<IApiResponse<IRegisterDeviceTokenResponse>> {
  const response = await http.post<IApiResponse<IRegisterDeviceTokenResponse>>('/notification/firebase/register-device-token', params)
  return response.data
}

export async function unregisterDeviceToken(token: string): Promise<IApiResponse<void>> {
  const response = await http.delete<IApiResponse<void>>(`/notification/firebase/unregister-device-token/${token}`)
  return response.data
}