import { VOUCHER_TYPE } from '@/constants'
import { z } from 'zod'

export const createVoucherGroupSchema = z.object({
  title: z.string().min(1),
  description: z.optional(z.string()),
})

export const updateVoucherGroupSchema = z.object({
  slug: z.string(),
  title: z.string().min(1),
  description: z.optional(z.string()),
})

export const createVoucherSchema = z.object({
  voucherGroup: z.string(),
  title: z.string().min(1),
  description: z.optional(z.string()),
  type: z.enum([VOUCHER_TYPE.FIXED_VALUE, VOUCHER_TYPE.PERCENT_ORDER]),
  code: z.string().min(1),
  value: z.number().int().positive(),
  maxUsage: z.number().int().positive(),
  minOrderValue: z.number().int().nonnegative(),
  isActive: z.boolean(),
  isPrivate: z.boolean(),
  startDate: z.string(),
  endDate: z.string(),
  isVerificationIdentity: z.boolean(),
  numberOfUsagePerUser: z.number().int().positive(),
})

export const createMultipleVoucherSchema = z.object({
  voucherGroup: z.string(),
  numberOfVoucher: z.number().int().positive(),
  title: z.string().min(1),
  description: z.optional(z.string()),
  type: z.enum([VOUCHER_TYPE.FIXED_VALUE, VOUCHER_TYPE.PERCENT_ORDER]),
  startDate: z.string(),
  endDate: z.string(),
  value: z.number().int().positive(),
  minOrderValue: z.number().int().nonnegative(),
  maxUsage: z.number().int().positive(),
  isActive: z.boolean(),
  isPrivate: z.boolean(),
  isVerificationIdentity: z.boolean(),
  numberOfUsagePerUser: z.number().int().positive(),
})

export const updateVoucherSchema = z
  .object({
    voucherGroup: z.string(),
    slug: z.string(),
    createdAt: z.string(),
    title: z.string().min(1),
    description: z.optional(z.string()),
    type: z.enum([VOUCHER_TYPE.FIXED_VALUE, VOUCHER_TYPE.PERCENT_ORDER]),
    code: z.string().min(1),
    value: z.number().int().positive(),
    maxUsage: z.number().int().positive(),
    minOrderValue: z.number().int().nonnegative(),
    isActive: z.boolean(),
    isPrivate: z.boolean(),
    startDate: z.string(),
    endDate: z.string(),
    isVerificationIdentity: z.boolean(),
    numberOfUsagePerUser: z.number().int().positive(),
  })
  .refine(
    (data) => {
      if (data.type === VOUCHER_TYPE.PERCENT_ORDER) {
        return data.value >= 1 && data.value <= 100
      }
      return true // valid for FIXED_VALUE
    },
    {
      message: 'Giá trị phần trăm phải từ 1 đến 100',
      path: ['value'],
    },
  )

export type TCreateVoucherGroupSchema = z.infer<typeof createVoucherGroupSchema>
export type TUpdateVoucherGroupSchema = z.infer<typeof updateVoucherGroupSchema>

export type TCreateVoucherSchema = z.infer<typeof createVoucherSchema>
export type TUpdateVoucherSchema = z.infer<typeof updateVoucherSchema>

export type TCreateMultipleVoucherSchema = z.infer<
  typeof createMultipleVoucherSchema
>
