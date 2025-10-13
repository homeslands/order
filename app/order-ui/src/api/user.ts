import { http } from '@/utils'
import {
  IApiResponse,
  IUserInfo,
  IPaginationResponse,
  IUserQuery,
  ICreateUserRequest,
  IUpdateUserRequest,
  ICreateUserGroupRequest,
  IUserGroup,
  IUpdateUserGroupRequest,
  IAddUserGroupMemberRequest,
  IAddMultipleUserGroupMemberRequest,
  IUserGroupMember,
  IGetAllUserGroupRequest,
  IGetUserGroupMemberRequest,
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

export async function getUserBySlug(
  slug: string,
): Promise<IApiResponse<IUserInfo>> {
  const response = await http.get<IApiResponse<IUserInfo>>(`/user/${slug}`)
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

export async function updateUser(
  data: IUpdateUserRequest,
): Promise<IApiResponse<IUserInfo>> {
  const response = await http.patch<IApiResponse<IUserInfo>>(
    `/user/${data.slug}`,
    data,
  )
  return response.data
}

export async function lockUser(slug: string): Promise<IApiResponse<null>> {
  const response = await http.patch<IApiResponse<null>>(
    `/user/${slug}/toggle-active`,
  )
  return response.data
}

export async function createUserGroup(
  data: ICreateUserGroupRequest,
): Promise<IApiResponse<IUserGroup>> {
  const response = await http.post<IApiResponse<IUserGroup>>(
    '/user-group',
    data,
  )
  return response.data
}

export async function getAllUserGroups(
  params: IGetAllUserGroupRequest,
): Promise<IApiResponse<IPaginationResponse<IUserGroup>>> {
  const response = await http.get<
    IApiResponse<IPaginationResponse<IUserGroup>>
  >('/user-group', {
    params,
  })
  return response.data
}

export async function getUserGroupBySlug(
  slug: string,
): Promise<IApiResponse<IUserGroup>> {
  const response = await http.get<IApiResponse<IUserGroup>>(
    `/user-group/${slug}`,
  )
  return response.data
}

export async function updateUserGroup(
  param: IUpdateUserGroupRequest,
): Promise<IApiResponse<IUserGroup>> {
  const response = await http.patch<IApiResponse<IUserGroup>>(
    `/user-group/${param.slug}`,
    param,
  )
  return response.data
}

export async function deleteUserGroup(
  slug: string,
): Promise<IApiResponse<null>> {
  const response = await http.delete<IApiResponse<null>>(`/user-group/${slug}`)
  return response.data
}

// user group member
export async function addUserGroupMember(
  data: IAddUserGroupMemberRequest,
): Promise<IApiResponse<null>> {
  const response = await http.post<IApiResponse<null>>(
    `/user-group-member`,
    data,
  )
  return response.data
}

export async function addMultipleUserGroupMember(
  data: IAddMultipleUserGroupMemberRequest,
): Promise<IApiResponse<null>> {
  const response = await http.post<IApiResponse<null>>(
    `/user-group-member/bulk`,
    data,
  )
  return response.data
}

export async function getUserGroupMembers(
  params: IGetUserGroupMemberRequest,
): Promise<IApiResponse<IPaginationResponse<IUserGroupMember>>> {
  const response = await http.get<
    IApiResponse<IPaginationResponse<IUserGroupMember>>
  >(`/user-group-member`, {
    params,
  })
  return response.data
}

export async function getUserGroupMemberBySlug(
  slug: string,
): Promise<IApiResponse<IUserGroupMember>> {
  const response = await http.get<IApiResponse<IUserGroupMember>>(
    `/user-group-member/${slug}`,
  )
  return response.data
}

export async function deleteUserGroupMember(
  slug: string,
): Promise<IApiResponse<null>> {
  const response = await http.delete<IApiResponse<null>>(
    `/user-group-member/${slug}`,
  )
  return response.data
}
