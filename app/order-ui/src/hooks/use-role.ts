import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import { createRole, deleteRole, getRoleBySlug, getRoles, updateRole } from '@/api'
import { QUERYKEY } from '@/constants'
import { ICreateRoleRequest, IUpdateRoleRequest } from '@/types'

export const useRoles = () => {
  return useQuery({
    queryKey: [QUERYKEY.roles],
    queryFn: () => getRoles(),
    placeholderData: keepPreviousData,
  })
}

export const useRoleBySlug = (slug: string) => {
  return useQuery({
    queryKey: [QUERYKEY.roles, slug],
    queryFn: () => getRoleBySlug(slug),
  })
}

export const useCreateRole = () => {
  return useMutation({
    mutationFn: async (data: ICreateRoleRequest) => {
      return createRole(data)
    },
  })
}

export const useUpdateRole = () => {
  return useMutation({
    mutationFn: async (data: IUpdateRoleRequest) => {
      return updateRole(data)
    },
  })
}

export const useDeleteRole = () => {
  return useMutation({
    mutationFn: async (slug: string) => {
      return deleteRole(slug)
    },
  })
}
