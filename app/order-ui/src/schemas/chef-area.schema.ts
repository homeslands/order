import { z } from 'zod'

export const createChefAreaSchema = z.object({
  branch: z.string(),
  name: z.string().min(3),
  description: z.optional(z.string()),
})

export const updateChefAreaSchema = z.object({
  slug: z.string(),
  branch: z.string(),
  name: z.string().min(3),
  description: z.optional(z.string()),
})

export const addProductToChefAreaSchema = z.object({
  chefArea: z.string(),
  product: z.string(),
})

export const updateProductInChefAreaSchema = z.object({
  slug: z.string(),
  chefArea: z.string(),
  product: z.string(),
})

export type TCreateChefAreaSchema = z.infer<typeof createChefAreaSchema>
export type TUpdateChefAreaSchema = z.infer<typeof updateChefAreaSchema>
export type TAddProductToChefAreaSchema = z.infer<
  typeof addProductToChefAreaSchema
>
export type TUpdateProductInChefAreaSchema = z.infer<
  typeof updateProductInChefAreaSchema
>
