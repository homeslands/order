import { z } from 'zod'

export const createVoucherSchema = z.object({
  title: z.string().min(1),
  description: z.optional(z.string()),
  code: z.string().min(1),
  value: z.number().int().positive(),
  maxUsage: z.number().int().positive(),
  minOrderValue: z.number().int().positive(),
  isActive: z.boolean(),
  startDate: z.string(),
  endDate: z.string(),
})

export const updateVoucherSchema = z.object({
  slug: z.string(),
  createdAt: z.string(),
  title: z.string().min(1),
  description: z.optional(z.string()),
  code: z.string().min(1),
  value: z.number().int().positive(),
  maxUsage: z.number().int().positive(),
  minOrderValue: z.number().int().positive(),
  isActive: z.boolean(),
  startDate: z.string(),
  endDate: z.string(),
})

export type TCreateVoucherSchema = z.infer<typeof createVoucherSchema>
export type TUpdateVoucherSchema = z.infer<typeof updateVoucherSchema>
