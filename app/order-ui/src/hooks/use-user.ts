import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

import {
  createUser,
  getUsers,
  resetPassword,
  updateUser,
  updateUserRole,
} from '@/api'
import { ICreateUserRequest, IUpdateUserRequest, IUserQuery } from '@/types'

export const useUsers = (q: IUserQuery | null) => {
  return useQuery({
    queryKey: ['users', JSON.stringify(q)],
    queryFn: () => (q ? getUsers(q) : Promise.resolve(null)),
    placeholderData: keepPreviousData,
    enabled: !!q,
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

export const useUpdateUserRole = () => {
  return useMutation({
    mutationFn: async ({ slug, role }: { slug: string; role: string }) => {
      return updateUserRole(slug, role)
    },
  })
}
