import { VerificationMethod } from '@/constants'

export interface ILoginRequest {
  phonenumber: string
  password: string
}

export interface ILoginResponse {
  message: string
  result: {
    accessToken: string
    expireTime: string
    refreshToken: string
    expireTimeRefreshToken: string
  }
  method: string
  status: number
  timestamp: string
}

export interface IRegisterSchema {
  dob: string
  firstName: string
  lastName: string
  phonenumber: string
  password: string
  confirmPassword: string
}

export interface IRegisterRequest {
  phonenumber: string
  password: string
  firstName: string
  lastName: string
  dob: string
}

export interface IInitiateForgotPasswordRequest {
  email?: string
  phonenumber?: string
  verificationMethod: VerificationMethod
}

export interface IInitiateForgotPasswordResponse {
  expiresAt: string
}

export interface IResendOTPForgotPasswordRequest {
  email?: string
  phonenumber?: string
  verificationMethod: VerificationMethod
}

export interface IConfirmForgotPasswordRequest {
  newPassword: string
  token: string
}

export interface IVerifyOTPForgotPasswordRequest {
  code: string
}

export interface IVerifyOTPForgotPasswordResponse {
  token: string
}

export interface IRefreshTokenResponse {
  expireTime: string
  expireTimeRefreshToken: string
  accessToken: string
  refreshToken: string
}

export interface IToken {
  scope: {
    role: string
    permissions: string[]
  }
}
