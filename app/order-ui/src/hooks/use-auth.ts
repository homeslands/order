import {
  authorityGroup,
  confirmEmailVerification,
  confirmPhoneNumberVerification,
  confirmForgotPassword,
  createPermission,
  deletePermission,
  forgotPasswordAndGetToken,
  forgotPasswordAndResetPassword,
  initiateForgotPassword,
  login,
  register,
  resendEmailVerification,
  resendForgotPassword,
  resendPhoneNumberVerification,
  verifyEmail,
  verifyOTPForgotPassword,
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
  IInitiateForgotPasswordRequest,
  IResendForgotPasswordRequest,
  IVerifyOTPForgotPasswordRequest,
  IConfirmForgotPasswordRequest,
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

export const useInitiateForgotPassword = () => {
  return useMutation({
    mutationFn: async (params: IInitiateForgotPasswordRequest) => {
      return initiateForgotPassword(params)
    },
  })
}

export const useResendForgotPassword = () => {
  return useMutation({
    mutationFn: async (params: IResendForgotPasswordRequest) => {
      return resendForgotPassword(params)
    },
  })
}

export const useVerifyOTPForgotPassword = () => {
  return useMutation({
    mutationFn: async (params: IVerifyOTPForgotPasswordRequest) => {
      return verifyOTPForgotPassword(params)
    },
  })
}

export const useConfirmForgotPassword = () => {
  return useMutation({
    mutationFn: async (params: IConfirmForgotPasswordRequest) => {
      return confirmForgotPassword(params)
    },
  })
}
