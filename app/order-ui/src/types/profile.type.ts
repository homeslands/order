import { IBase } from './base.type'

export interface IProfileResponse {
  userId: string
}

export interface IVerifyEmailRequest {
  accessToken: string
  email: string
}

export interface IConfirmEmailVerificationRequest {
  token: string // token get from url in email
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
