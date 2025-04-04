import { z } from 'zod'

export const createMenuSchema = z.object({
  date: z.string().min(1),
  branchSlug: z.string().min(1),
  isTemplate: z.boolean(),
})

export const updateMenuSchema = z.object({
  slug: z.string(),
  date: z.string(),
  branchSlug: z.string().min(1),
  isTemplate: z.boolean(),
})

export const addMenuItemSchema = z.object({
  menuSlug: z.string(),
  productSlug: z.string(),
  productName: z.string(),
  defaultStock: z.number().min(0),
})

export const addMenuItemsSchema = z.array(
  z.object({
    menuSlug: z.string(),
    productSlug: z.string(), // Mỗi phần tử chỉ chứa 1 `productSlug`
    defaultStock: z.number().min(0),
  }),
)

export const updateMenuItemSchema = z.object({
  slug: z.string(),
  menuSlug: z.string(),
  productSlug: z.string(),
  productName: z.string(),
  defaultStock: z.number().min(0),
  isLocked: z.boolean(),
  isResetCurrentStock: z.boolean(),
})

export type TCreateMenuSchema = z.infer<typeof createMenuSchema>
export type TUpdateMenuSchema = z.infer<typeof updateMenuSchema>
export type TAddMenuItemSchema = z.infer<typeof addMenuItemSchema>
export type TAddMenuItemsSchema = z.infer<typeof addMenuItemsSchema>
export type TUpdateMenuItemSchema = z.infer<typeof updateMenuItemSchema>
