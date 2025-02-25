import { z } from 'zod'

export const bannerSchema = z.object({
  title: z.string(),
  content: z.string(),
})

export type TBannerSchema = z.infer<typeof bannerSchema>
