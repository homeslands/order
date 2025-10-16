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

export interface IForgotPasswordRequest {
  email: string
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

export interface IForgotPasswordStore {
  token: string
  step: number
  email: string
  phoneNumber: string
  verificationMethod: VerificationMethod
  setToken: (token: string) => void
  setStep: (step: number) => void
  setEmail: (email: string) => void
  setPhoneNumber: (phoneNumber: string) => void
  setVerificationMethod: (verificationMethod: VerificationMethod) => void
  clearForgotPassword: () => void
}
