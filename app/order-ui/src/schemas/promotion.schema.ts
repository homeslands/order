import { z } from 'zod'

export const createPromotionSchema = z
  .object({
    title: z.string().min(1),
    branchSlug: z.string(),
    description: z.optional(z.string()),
    type: z.string(),
    value: z.number().int().positive(),
    startDate: z.string().refine((date) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return new Date(date) >= today
    }, 'Start date must be today or later'),
    endDate: z.string(),
  })
  .refine(
    (data) => {
      return new Date(data.endDate) >= new Date(data.startDate)
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    },
  )

export const updatePromotionSchema = z.object({
  slug: z.string(),
  branch: z.string(),
  createdAt: z.string(),
  title: z.string().min(1),
  description: z.optional(z.string()),
  type: z.string(),
  value: z.number().int().positive(),
  startDate: z.string(),
  endDate: z.string(),
})

export type TCreatePromotionSchema = z.infer<typeof createPromotionSchema>
export type TUpdatePromotionSchema = z.infer<typeof updatePromotionSchema>
