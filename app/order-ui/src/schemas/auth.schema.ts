import { PHONE_NUMBER_REGEX } from '@/constants'
import * as z from 'zod'

export const loginSchema = z.object({
  phonenumber: z.string(),
  password: z.string(),
})

export const registerSchema = z
  .object({
    phonenumber: z
      .string()
      .min(10)
      .max(10)
      .regex(PHONE_NUMBER_REGEX, 'Số điện thoại không hợp lệ'),
    // email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải chứa tối thiểu 6 kí tự'),
    confirmPassword: z.string().min(6, 'Mật khẩu phải chứa tối thiểu 6 kí tự'),
    // firstName: z.string().min(1),
    // lastName: z.string().min(1),
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

export const verifyEmailSchema = z.object({
  accessToken: z.string(),
  email: z.string().email(),
})

export type TRegisterSchema = z.infer<typeof registerSchema>
export type TLoginSchema = z.infer<typeof loginSchema>
export type TResetPasswordSchema = z.infer<typeof resetPasswordSchema>

export type TForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>
export type TVerifyEmailSchema = z.infer<typeof verifyEmailSchema>
