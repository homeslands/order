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
  value: z
    .union([z.string().regex(/^\d+$/).transform(Number), z.number()])
    .refine((val) => val > 0, {
      message: 'Giá trị phải lớn hơn 0',
    }),
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
  value: z
    .union([z.string().regex(/^\d+$/).transform(Number), z.number()])
    .refine((val) => val > 0, {
      message: 'Giá trị phải lớn hơn 0',
    }),
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
    value: z
      .union([z.string().regex(/^\d+$/).transform(Number), z.number()])
      .refine((val) => val > 0, {
        message: 'Giá trị phải lớn hơn 0',
      }),
    maxUsage: z.number().int().positive(),
    minOrderValue: z.number().int().nonnegative(),
    remainingUsage: z.number().int().positive(),
    isActive: z.boolean(),
    isPrivate: z.boolean(),
    startDate: z.string(),
    endDate: z.string(),
    isVerificationIdentity: z.boolean(),
    numberOfUsagePerUser: z.number().int().positive(),
  })
  .superRefine((data, ctx) => {
    if (data.type === VOUCHER_TYPE.PERCENT_ORDER) {
      if (data.value < 1 || data.value > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['value'],
          message: 'Giá trị phần trăm phải từ 1 đến 100',
        })
      }
    }
  })

export type TCreateVoucherGroupSchema = z.infer<typeof createVoucherGroupSchema>
export type TUpdateVoucherGroupSchema = z.infer<typeof updateVoucherGroupSchema>

export type TCreateVoucherSchema = z.infer<typeof createVoucherSchema>
export type TUpdateVoucherSchema = z.infer<typeof updateVoucherSchema>

export type TCreateMultipleVoucherSchema = z.infer<
  typeof createMultipleVoucherSchema
>
