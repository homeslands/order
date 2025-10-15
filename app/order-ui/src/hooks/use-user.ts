import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import {
  addMultipleUserGroupMember,
  addUserGroupMember,
  createUser,
  createUserGroup,
  deleteUserGroup,
  deleteUserGroupMember,
  getAllUserGroups,
  getUserBySlug,
  getUserGroupBySlug,
  getUserGroupMemberBySlug,
  getUserGroupMembers,
  getUsers,
  lockUser,
  resetPassword,
  updateUser,
  updateUserGroup,
  updateUserRole,
} from '@/api'
import {
  IAddMultipleUserGroupMemberRequest,
  IAddUserGroupMemberRequest,
  ICreateUserGroupRequest,
  ICreateUserRequest,
  IGetAllUserGroupRequest,
  IGetUserGroupMemberRequest,
  IUpdateUserGroupRequest,
  IUpdateUserRequest,
  IUserQuery,
} from '@/types'
import { QUERYKEY } from '@/constants'

export const useUsers = (q: IUserQuery | null, enabled?: boolean) => {
  return useQuery({
    queryKey: ['users', JSON.stringify(q)],
    queryFn: () => (q ? getUsers(q) : Promise.resolve(null)),
    placeholderData: keepPreviousData,
    enabled: !!q && !!enabled,
  })
}

export const useUserBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['user', slug],
    queryFn: () => getUserBySlug(slug),
    placeholderData: keepPreviousData,
    enabled: !!slug,
  })
}

export const useCreateUser = () => {
  return useMutation({
    mutationFn: async (data: ICreateUserRequest) => {
      return createUser(data)
    },
  })
}

export const useUpdateUser = () => {
  return useMutation({
    mutationFn: async (data: IUpdateUserRequest) => {
      return updateUser(data)
    },
  })
}

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (user: string) => {
      return resetPassword(user)
    },
  })
}

export const useLockUser = () => {
  return useMutation({
    mutationFn: async (slug: string) => {
      return lockUser(slug)
    },
  })
}

export const useUpdateUserRole = () => {
  return useMutation({
    mutationFn: async ({ slug, role }: { slug: string; role: string }) => {
      return updateUserRole(slug, role)
    },
  })
}

export const useUserGroups = (params: IGetAllUserGroupRequest) => {
  return useQuery({
    queryKey: [QUERYKEY.userGroups, JSON.stringify(params)],
    queryFn: () => getAllUserGroups(params),
    placeholderData: keepPreviousData,
    enabled: !!params,
  })
}

export const useUserGroupBySlug = (slug: string) => {
  return useQuery({
    queryKey: [QUERYKEY.userGroup, slug],
    queryFn: () => getUserGroupBySlug(slug),
    placeholderData: keepPreviousData,
    enabled: !!slug,
  })
}

export const useCreateUserGroup = () => {
  return useMutation({
    mutationFn: async (data: ICreateUserGroupRequest) => {
      return createUserGroup(data)
    },
  })
}

export const useUpdateUserGroup = () => {
  return useMutation({
    mutationFn: async (param: IUpdateUserGroupRequest) => {
      return updateUserGroup(param)
    },
  })
}

export const useDeleteUserGroup = () => {
  return useMutation({
    mutationFn: async (slug: string) => {
      return deleteUserGroup(slug)
    },
  })
}

export const useUserGroupMembers = (params: IGetUserGroupMemberRequest) => {
  return useQuery({
    queryKey: [QUERYKEY.userGroupMembers, JSON.stringify(params)],
    queryFn: () => getUserGroupMembers(params),
    placeholderData: keepPreviousData,
    enabled: !!params,
  })
}

export const useUserGroupMemberBySlug = (slug: string) => {
  return useQuery({
    queryKey: [QUERYKEY.userGroupMember, slug],
    queryFn: () => getUserGroupMemberBySlug(slug),
    placeholderData: keepPreviousData,
    enabled: !!slug,
  })
}

export const useAddGroupMember = () => {
  return useMutation({
    mutationFn: async (data: IAddUserGroupMemberRequest) => {
      return addUserGroupMember(data)
    },
  })
}

export const useAddMultipleGroupMember = () => {
  return useMutation({
    mutationFn: async (data: IAddMultipleUserGroupMemberRequest) => {
      return addMultipleUserGroupMember(data)
    },
  })
}

export const useDeleteUserGroupMember = () => {
  return useMutation({
    mutationFn: async (slug: string) => {
      return deleteUserGroupMember(slug)
    },
  })
}
