import { z } from 'zod'

export const bannerCreateSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được trống").max(255, "Tiêu đề không được quá 255 ký tự"),
  content: z.string().min(1, "Nội dung không được trống"),
  url: z.string(),
  useButtonUrl: z.boolean(),
}).refine((data) => !data.useButtonUrl || (data.useButtonUrl && data.url.length > 0), {
  message: "Liên kết không được trống",
  path: ["url"]
})

export const bannerUpadateSchema = z.object({
  slug: z.string(),
  title: z.string().min(1, "Tiêu đề không được trống").max(255, "Tiêu đề không được quá 255 ký tự"),
  content: z.string().min(1, "Nội dung không được trống"),
  url: z.string(),
  useButtonUrl: z.boolean(),
  isActive: z.boolean(),
}).refine(data => !data.useButtonUrl || (data.useButtonUrl && data.url.length > 0), {
  message: "Liên kết không được trống",
  path: ["url"]
})

export type TBannerCreateSchema = z.infer<typeof bannerCreateSchema>
export type TBannerUpdateSchema = z.infer<typeof bannerUpadateSchema>
