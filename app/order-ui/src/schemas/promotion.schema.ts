import { z } from 'zod'

export const createPromotionSchema = z
  .object({
    title: z.string().min(1),
    branchSlug: z.string(),
    description: z.string().optional(),
    type: z.string(),
    value: z.number().int().positive(),
    startDate: z.string().refine(
      (date) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const start = new Date(date)
        return start >= today
      },
      {
        message: 'Start date must be today or later',
      },
    ),
    endDate: z.string().refine(
      (date) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const end = new Date(date)
        return end >= today
      },
      {
        message: 'End date must be today or later',
      },
    ),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate)
      const end = new Date(data.endDate)
      return end >= start
    },
    {
      message: 'End date must be after or equal to start date',
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
