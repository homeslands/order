import { PHONE_NUMBER_REGEX } from '@/constants'
import { z } from 'zod'

export const userInfoSchema = z.object({
  slug: z.string(),
  image: z.string().optional(),
  phonenumber: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  dob: z.string(),
  email: z.string(),
  address: z.string(),
  branch: z.string(),
})

export const userRoleSchema = z.object({
  slug: z.string(),
  name: z.string(),
  role: z.string(),
})

export const createUserSchema = z
  .object({
    phonenumber: z
      .string()
      .min(10)
      .max(10)
      .regex(PHONE_NUMBER_REGEX, 'login.phoneNumberInvalid'),
    password: z.string().min(6, 'Mật khẩu phải chứa tối thiểu 6 kí tự'),
    confirmPassword: z.string().min(6, 'Mật khẩu phải chứa tối thiểu 6 kí tự'),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    branch: z.optional(z.string()),
    role: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  })

export const updateUserSchema = z.object({
  slug: z.string(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dob: z.string(),
  email: z.string().email('login.emailInvalid'),
  address: z.string(),
  branch: z.string(),
})

export type TUserInfoSchema = z.infer<typeof userInfoSchema>
export type TUserRoleSchema = z.infer<typeof userRoleSchema>
export type TCreateUserSchema = z.infer<typeof createUserSchema>
export type TUpdateUserSchema = z.infer<typeof updateUserSchema>
