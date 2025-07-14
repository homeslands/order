import {
  authorityGroup,
  confirmEmailVerification,
  confirmPhoneNumberVerification,
  createPermission,
  deletePermission,
  forgotPasswordAndGetToken,
  forgotPasswordAndResetPassword,
  login,
  register,
  resendEmailVerification,
  resendPhoneNumberVerification,
  verifyEmail,
  verifyPhoneNumber,
} from '@/api'
// import { QUERYKEY } from '@/constants'
import {
  ILoginRequest,
  IRegisterRequest,
  IForgotPasswordRequest,
  IVerifyEmailRequest,
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

export const useVerifyPhoneNumber = () => {
  return useMutation({
    mutationFn: async () => {
      return verifyPhoneNumber()
    },
  })
}

export const useConfirmPhoneNumberVerification = () => {
  return useMutation({
    mutationFn: async (code: string) => {
      return confirmPhoneNumberVerification(code)
    },
  })
}

export const useResendPhoneNumberVerification = () => {
  return useMutation({
    mutationFn: async () => {
      return resendPhoneNumberVerification()
    },
  })
}

export const useConfirmEmailVerification = () => {
  return useMutation({
    mutationFn: async (code: string) => {
      return confirmEmailVerification(code)
    },
  })
}

export const useResendEmailVerification = () => {
  return useMutation({
    mutationFn: async () => {
      return resendEmailVerification()
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
