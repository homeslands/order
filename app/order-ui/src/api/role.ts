import { http } from '@/utils'
import {
  IApiResponse,
  ICreateRoleRequest,
  IRole,
  IUpdateRoleRequest,
} from '@/types'

export async function getRoles(): Promise<IApiResponse<IRole[]>> {
  const response = await http.get<IApiResponse<IRole[]>>('/role')
  return response.data
}

export async function getRoleBySlug(
  slug: string,
): Promise<IApiResponse<IRole>> {
  const response = await http.get<IApiResponse<IRole>>(`/role/${slug}`)
  return response.data
}

export async function createRole(
  role: ICreateRoleRequest,
): Promise<IApiResponse<IRole>> {
  const response = await http.post<IApiResponse<IRole>>('/role', role)
  return response.data
}

export async function updateRole(
  role: IUpdateRoleRequest,
): Promise<IApiResponse<IRole>> {
  const response = await http.patch<IApiResponse<IRole>>(
    `/role/${role.slug}`,
    role,
  )
  return response.data
}
