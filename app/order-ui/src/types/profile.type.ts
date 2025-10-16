import { VerificationMethod } from '@/constants'
import { IBase } from './base.type'

export interface IProfileResponse {
  userId: string
}

export interface IInitiateForgotPasswordRequest {
  email?: string
  phonenumber?: string
  verificationMethod: VerificationMethod
}

export interface IResendForgotPasswordRequest {
  email?: string
  phoneNumber?: string
  verificationMethod: VerificationMethod
}

export interface IVerifyOTPForgotPasswordRequest {
  email?: string
  phoneNumber?: string
  verificationMethod: VerificationMethod
  code: string
}

export interface IForgotPasswordResponse extends IBase {
  expiresAt: string
}

export interface IVerifyOTPForgotPasswordResponse extends IBase {
  token: string
}

export interface IConfirmForgotPasswordRequest {
  newPassword: string
  token: string
}

export interface IVerifyEmailRequest {
  accessToken: string
  email: string
}

export interface IConfirmEmailVerificationRequest {
  email: string
}

export interface IAuthority extends IBase {
  name: string
  description: string
  code: string
}

export interface IAuthorityGroup extends IBase {
  name: string
  code: string
  description: string
  authorities: IAuthority[]
}

export interface IGetAuthorityGroupsRequest {
  role?: string
  inRole?: boolean
}

export interface ICreatePermissionRequest {
  role: string
  createAuthorities: string[]
  deleteAuthorities: string[]
}

export interface IEmailVerificationResponse extends IBase {
  expiresAt: string
}

export interface IVerifyPhoneNumberRequest {
  expiresAt: string
}
