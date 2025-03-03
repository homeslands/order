import * as z from 'zod'

// import { PHONE_NUMBER_REGEX } from '@/constants'

export const loginSchema = z.object({
  // phoneNumber: z.string().min(10).max(10).regex(PHONE_NUMBER_REGEX, 'login.phoneNumberInvalid'),
  phonenumber: z.string(),
  password: z.string(),
})

export const registerSchema = z
  .object({
    // phoneNumber: z.string().min(10).max(10).regex(PHONE_NUMBER_REGEX, 'login.phoneNumberInvalid'),
    email: z.string().email('Email không hợp lệ'),
    phonenumber: z.string(),
    password: z.string().min(6, 'Mật khẩu phải chứa tối thiểu 6 kí tự'),
    confirmPassword: z.string().min(6, 'Mật khẩu phải chứa tối thiểu 6 kí tự'),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6),
    confirmPassword: z.string().min(6),
    token: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
  })

export type TResetPasswordSchema = z.infer<typeof resetPasswordSchema>

export type TForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>
