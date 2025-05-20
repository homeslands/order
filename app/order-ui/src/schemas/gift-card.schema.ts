import { z } from 'zod'

export const createGiftCardSchema = z.object({
  title: z.string().min(1),
  description: z.optional(z.string()),
  file: z.optional(z.instanceof(File)),
  points: z.coerce.number().min(1),
  price: z.coerce.number().min(1),
  isActive: z.boolean().default(true),
})

export const updateGiftCardSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.optional(z.string()),
  points: z.coerce.number().min(1),
  price: z.coerce.number().min(1),
  file: z.optional(z.instanceof(File)),
  isActive: z.boolean().default(true),
})

export type TCreateGiftCardSchema = z.infer<typeof createGiftCardSchema>
export type TUpdateGiftCardSchema = z.infer<typeof updateGiftCardSchema>
