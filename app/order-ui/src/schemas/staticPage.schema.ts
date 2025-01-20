import { z } from 'zod'

export const staticPageSchema = z.object({
  key: z.string(),
  title: z.string(),
  content: z.string(),
})

export const updateStaticPageSchema = z.object({
  slug: z.string(),
  key: z.string(),
  title: z.string(),
  content: z.string(),
})

export type TStaticPageSchema = z.infer<typeof staticPageSchema>
export type TUpdateStaticPageSchema = z.infer<typeof updateStaticPageSchema>
