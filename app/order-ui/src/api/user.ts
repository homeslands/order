import { http } from '@/utils'
import {
  IApiResponse,
  IUserInfo,
  IPaginationResponse,
  IUserQuery,
  ICreateUserRequest,
} from '@/types'

export async function getUsers(
  params: IUserQuery | null,
): Promise<IApiResponse<IPaginationResponse<IUserInfo>>> {
  const response = await http.get<IApiResponse<IPaginationResponse<IUserInfo>>>(
    '/user',
    {
      params,
    },
  )
  return response.data
}

export async function resetPassword(user: string): Promise<IApiResponse<null>> {
  const response = await http.post<IApiResponse<null>>(
    `/user/${user}/reset-password`,
  )
  return response.data
}

export async function updateUserRole(
  slug: string,
  role: string,
): Promise<IApiResponse<null>> {
  const response = await http.post<IApiResponse<null>>(`/user/${slug}/role`, {
    role,
  })
  return response.data
}

export async function createUser(
  data: ICreateUserRequest,
): Promise<IApiResponse<IUserInfo>> {
  const response = await http.post<IApiResponse<IUserInfo>>('/user', data)
  return response.data
}
