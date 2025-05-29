import { z } from 'zod'

export const createGiftCardSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.optional(z.string().max(1000)),
  file: z.optional(z.instanceof(File)),
  points: z.coerce.number().min(1000).max(10000000),
  price: z.coerce.number().min(1000).max(10000000),
  isActive: z.boolean().default(true),
})

export const updateGiftCardSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1).max(500),
  description: z.optional(z.string().max(1000)),
  points: z.coerce.number().min(1000).max(10000000),
  price: z.coerce.number().min(1000).max(10000000),
  file: z.optional(z.instanceof(File)),
  isActive: z.boolean().default(true),
})

export type TCreateGiftCardSchema = z.infer<typeof createGiftCardSchema>
export type TUpdateGiftCardSchema = z.infer<typeof updateGiftCardSchema>
