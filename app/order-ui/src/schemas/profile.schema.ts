import { z } from 'zod'

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'Tên không được để trống'),
  lastName: z.string().min(1, 'Họ không được để trống'),
  // email: z.string().email('Email không hợp lệ'),
  dob: z.string().min(1, 'Ngày sinh không được để trống'),
  address: z.string().min(1, 'Địa chỉ không được để trống'),
  branch: z.string().optional(),
})

export const updatePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Mật khẩu cũ không hợp lệ'),
    newPassword: z.string().min(1, 'Mật khẩu mới không hợp lệ'),
    confirmPassword: z.string().min(1, 'Mật khẩu xác nhận không hợp lệ'),
  })
  .refine((data) => data.newPassword !== data.oldPassword, {
    message: 'Mật khẩu mới phải khác mật khẩu cũ',
    path: ['newPassword'],
  })

export type TUpdateProfileSchema = z.infer<typeof updateProfileSchema>
export type TUpdatePasswordSchema = z.infer<typeof updatePasswordSchema>
