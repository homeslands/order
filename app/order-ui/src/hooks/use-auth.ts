import {
  authorityGroup,
  confirmEmailVerification,
  confirmPhoneNumberVerification,
  createPermission,
  deletePermission,
  initiateForgotPassword,
  confirmForgotPassword,
  login,
  register,
  resendEmailVerification,
  resendPhoneNumberVerification,
  verifyEmail,
  verifyPhoneNumber,
  resendForgotPassword,
  verifyOTPForgotPassword,
} from '@/api'
// import { QUERYKEY } from '@/constants'
import {
  ILoginRequest,
  IRegisterRequest,
  IVerifyEmailRequest,
  IGetAuthorityGroupsRequest,
  ICreatePermissionRequest,
  IInitiateForgotPasswordRequest,
  IConfirmForgotPasswordRequest,
  IResendForgotPasswordRequest,
  IVerifyOTPForgotPasswordRequest,
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

export const useInitiateForgotPassword = () => {
  return useMutation({
    mutationFn: async (email: IInitiateForgotPasswordRequest) => {
      return initiateForgotPassword(email)
    },
  })
}

export const useResendForgotPassword = () => {
  return useMutation({
    mutationFn: async (data: IResendForgotPasswordRequest) => {
      return resendForgotPassword(data)
    },
  })
}

export const useVerifyOTPForgotPassword = () => {
  return useMutation({
    mutationFn: async (data: IVerifyOTPForgotPasswordRequest) => {
      return verifyOTPForgotPassword(data)
    },
  })
}

export const useConfirmForgotPassword = () => {
  return useMutation({
    mutationFn: async (data: IConfirmForgotPasswordRequest) => {
      return confirmForgotPassword(data)
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
