import {
  IApiResponse,
  ILoginResponse,
  IForgotPasswordRequest,
  IVerifyEmailRequest,
  IConfirmEmailVerificationRequest,
  IGetAuthorityGroupsRequest,
  IAuthorityGroup,
  ICreatePermissionRequest,
  IRegisterRequest,
} from '@/types'
import { http } from '@/utils'

export async function login(params: {
  phonenumber: string
  password: string
}): Promise<ILoginResponse> {
  const response = await http.post<ILoginResponse>('/auth/login', params)
  return response.data
}

export async function register(
  params: IRegisterRequest,
): Promise<IApiResponse<ILoginResponse>> {
  const response = await http.post<IApiResponse<ILoginResponse>>(
    '/auth/register',
    params,
  )
  return response.data
}

export async function forgotPasswordAndGetToken(
  email: IForgotPasswordRequest,
): Promise<IApiResponse<null>> {
  const response = await http.post<IApiResponse<null>>(
    '/auth/forgot-password/token',
    email,
  )
  return response.data
}

export async function forgotPasswordAndResetPassword(data: {
  newPassword: string
  token: string
}): Promise<IApiResponse<null>> {
  const response = await http.post<IApiResponse<null>>(
    '/auth/forgot-password',
    data,
  )
  return response.data
}

export async function verifyEmail(
  verifyParams: IVerifyEmailRequest,
): Promise<IApiResponse<null>> {
  const response = await http.post<IApiResponse<null>>(
    `/auth/request-verify-email`,
    verifyParams,
  )
  return response.data
}

export async function confirmEmailVerification(
  confirmEmailVerificationParams: IConfirmEmailVerificationRequest,
): Promise<IApiResponse<null>> {
  const response = await http.post<IApiResponse<null>>(
    `/auth/confirm-email-verification`,
    confirmEmailVerificationParams,
  )
  return response.data
}

export async function authorityGroup(
  params: IGetAuthorityGroupsRequest,
): Promise<IApiResponse<IAuthorityGroup[]>> {
  const response = await http.get<IApiResponse<IAuthorityGroup[]>>(
    '/authority-group',
    {
      params,
    },
  )
  return response.data
}

export async function createPermission(
  params: ICreatePermissionRequest,
): Promise<IApiResponse<null>> {
  const response = await http.post<IApiResponse<null>>(
    '/permission/bulk',
    params,
  )
  return response.data
}

export async function deletePermission(
  slug: string,
): Promise<IApiResponse<null>> {
  const response = await http.delete<IApiResponse<null>>(`/permission/${slug}`)
  return response.data
}
