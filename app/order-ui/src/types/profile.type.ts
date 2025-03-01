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
