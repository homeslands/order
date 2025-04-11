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
      .min(10, 'Số điện thoại không hợp lệ')
      .max(10, 'Số điện thoại không hợp lệ')
      .regex(PHONE_NUMBER_REGEX, 'Số điện thoại không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải chứa tối thiểu 6 kí tự'),
    confirmPassword: z.string().min(6, 'Mật khẩu phải chứa tối thiểu 6 kí tự'),
    firstName: z.string().min(1, 'Vui lòng nhập tên'),
    lastName: z.string().min(1, 'Vui lòng nhập họ'),
    branch: z.string().optional(),
    role: z.string().min(1, 'Vui lòng chọn vai trò'),
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
  email: z.string().email('Vui lòng nhập đúng định dạng email'),
  address: z.string().min(1, 'Vui lòng nhập địa chỉ'),
  branch: z.string().min(1, 'Vui lòng chọn chi nhánh'),
})

export type TUserInfoSchema = z.infer<typeof userInfoSchema>
export type TUserRoleSchema = z.infer<typeof userRoleSchema>
export type TCreateUserSchema = z.infer<typeof createUserSchema>
export type TUpdateUserSchema = z.infer<typeof updateUserSchema>
