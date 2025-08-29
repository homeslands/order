import {
  APPLICABILITY_RULE,
  VOUCHER_PAYMENT_METHOD,
  VOUCHER_TYPE,
} from '@/constants'
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

export const createVoucherSchema = z
  .object({
    voucherGroup: z.string(),
    title: z.string().min(1),
    applicabilityRule: z.enum([
      APPLICABILITY_RULE.ALL_REQUIRED,
      APPLICABILITY_RULE.AT_LEAST_ONE_REQUIRED,
    ]),
    description: z.optional(z.string()),
    type: z.enum([
      VOUCHER_TYPE.FIXED_VALUE,
      VOUCHER_TYPE.PERCENT_ORDER,
      VOUCHER_TYPE.SAME_PRICE_PRODUCT,
    ]),
    paymentMethods: z
      .array(
        z.enum([
          VOUCHER_PAYMENT_METHOD.CASH,
          VOUCHER_PAYMENT_METHOD.POINT,
          VOUCHER_PAYMENT_METHOD.BANK_TRANSFER,
        ]),
      )
      .min(1, { message: 'Vui lòng chọn ít nhất một phương thức thanh toán' }),
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
    products: z.array(z.string()),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'Ngày kết thúc phải sau ngày bắt đầu',
    path: ['endDate'],
  })
  .superRefine((data, ctx) => {
    // Validate percentage value
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

export const createMultipleVoucherSchema = z
  .object({
    voucherGroup: z.string(),
    numberOfVoucher: z.number().int().positive(),
    title: z.string().min(1),
    applicabilityRule: z.enum([
      APPLICABILITY_RULE.ALL_REQUIRED,
      APPLICABILITY_RULE.AT_LEAST_ONE_REQUIRED,
    ]),
    description: z.optional(z.string()),
    type: z.enum([
      VOUCHER_TYPE.FIXED_VALUE,
      VOUCHER_TYPE.PERCENT_ORDER,
      VOUCHER_TYPE.SAME_PRICE_PRODUCT,
    ]),
    paymentMethods: z
      .array(
        z.enum([
          VOUCHER_PAYMENT_METHOD.CASH,
          VOUCHER_PAYMENT_METHOD.POINT,
          VOUCHER_PAYMENT_METHOD.BANK_TRANSFER,
        ]),
      )
      .min(1, { message: 'Vui lòng chọn ít nhất một phương thức thanh toán' }),
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
    products: z.array(z.string()),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'Ngày kết thúc phải sau ngày bắt đầu',
    path: ['endDate'],
  })
  .superRefine((data, ctx) => {
    // Validate percentage value
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

export const updateVoucherSchema = z
  .object({
    voucherGroup: z.string(),
    slug: z.string(),
    createdAt: z.string(),
    title: z.string().min(1),
    applicabilityRule: z.enum([
      APPLICABILITY_RULE.ALL_REQUIRED,
      APPLICABILITY_RULE.AT_LEAST_ONE_REQUIRED,
    ]),
    description: z.optional(z.string()),
    type: z.enum([
      VOUCHER_TYPE.FIXED_VALUE,
      VOUCHER_TYPE.PERCENT_ORDER,
      VOUCHER_TYPE.SAME_PRICE_PRODUCT,
    ]),
    paymentMethods: z
      .array(
        z.enum([
          VOUCHER_PAYMENT_METHOD.CASH,
          VOUCHER_PAYMENT_METHOD.POINT,
          VOUCHER_PAYMENT_METHOD.BANK_TRANSFER,
        ]),
      )
      .min(1, { message: 'Vui lòng chọn ít nhất một phương thức thanh toán' }),
    code: z.string().min(1),
    value: z
      .union([z.string().regex(/^\d+$/).transform(Number), z.number()])
      .refine((val) => val > 0, {
        message: 'Giá trị phải lớn hơn 0',
      }),
    maxUsage: z.number().int().positive(),
    minOrderValue: z.number().int().nonnegative(),
    remainingUsage: z.number().int().nonnegative(),
    isActive: z.boolean(),
    isPrivate: z.boolean(),
    startDate: z.string(),
    endDate: z.string(),
    isVerificationIdentity: z.boolean(),
    numberOfUsagePerUser: z.number().int().positive(),
    products: z.array(z.string()),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'Ngày kết thúc phải sau ngày bắt đầu',
    path: ['endDate'],
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

    if (data.maxUsage < data.remainingUsage) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['maxUsage'],
        message: 'Số lượng tối đa không thể nhỏ hơn số lượng còn lại',
      })
    }
  })

export type TCreateVoucherGroupSchema = z.infer<typeof createVoucherGroupSchema>
export type TUpdateVoucherGroupSchema = z.infer<typeof updateVoucherGroupSchema>

export type TCreateVoucherSchema = z.infer<typeof createVoucherSchema>
export type TUpdateVoucherSchema = z.infer<typeof updateVoucherSchema>

export type TCreateMultipleVoucherSchema = z.infer<
  typeof createMultipleVoucherSchema
>
