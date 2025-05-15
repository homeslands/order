import {
  authorityGroup,
  confirmEmailVerification,
  createPermission,
  deletePermission,
  forgotPasswordAndGetToken,
  forgotPasswordAndResetPassword,
  login,
  register,
  verifyEmail,
} from '@/api'
// import { QUERYKEY } from '@/constants'
import {
  ILoginRequest,
  IRegisterRequest,
  IForgotPasswordRequest,
  IVerifyEmailRequest,
  IConfirmEmailVerificationRequest,
  IGetAuthorityGroupsRequest,
  ICreatePermissionRequest,
} from '@/types'
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'

export const useLogin = () => {
  return useMutation({
    mutationFn: async (data: ILoginRequest) => {
      const response = await login(data)
      return response
    },
  })
}

export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: IRegisterRequest) => {
      return register(data)
    },
  })
}

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (email: IForgotPasswordRequest) => {
      return forgotPasswordAndGetToken(email)
    },
  })
}

export const useResetPasswordForForgotPassword = () => {
  return useMutation({
    mutationFn: async (data: { newPassword: string; token: string }) => {
      return forgotPasswordAndResetPassword(data)
    },
  })
}

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: async (data: IVerifyEmailRequest) => {
      return verifyEmail(data)
    },
  })
}

export const useConfirmEmailVerification = () => {
  return useMutation({
    mutationFn: async (data: IConfirmEmailVerificationRequest) => {
      return confirmEmailVerification(data)
    },
  })
}

export const useGetAuthorityGroup = (q: IGetAuthorityGroupsRequest) => {
  return useQuery({
    queryKey: ['bankConnector'],
    queryFn: () => authorityGroup(q),
    placeholderData: keepPreviousData,
  })
}

export const useCreatePermission = () => {
  return useMutation({
    mutationFn: async (data: ICreatePermissionRequest) => {
      return createPermission(data)
    },
  })
}

export const useDeletePermission = () => {
  return useMutation({
    mutationFn: async (slug: string) => {
      return deletePermission(slug)
    },
  })
}
