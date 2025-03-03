import { z } from 'zod'

export const createProductSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm không được để trống').max(255, 'Tên sản phẩm không được quá 255 ký tự'),
  description: z.optional(z.string()),
  isLimit: z.boolean(),
  isTopSell: z.boolean(),
  isNew: z.boolean(),
  catalog: z.string().min(1, 'Danh mục không được để trống')
})

export const updateProductSchema = z.object({
  slug: z.string().min(1, 'Slug không được để trống'),
  name: z.string().min(1, 'Tên sản phẩm không được để trống').max(255, 'Tên sản phẩm không được quá 255 ký tự'),
  description: z.optional(z.string()),
  isLimit: z.boolean(),
  isActive: z.optional(z.boolean()),
  isTopSell: z.boolean(),
  isNew: z.boolean(),
  catalog: z.string().min(1, 'Danh mục không được để trống')
})

export const createProductVariantSchema = z.object({
  price: z.number().min(0, 'Giá sản phẩm không được nhỏ hơn 0'),
  size: z.string().min(1, 'Kích thước không được để trống'),
  product: z.string().min(1, 'Sản phẩm không được để trống')
})

export const updateProductVariantSchema = z.object({
  price: z.number().min(0, 'Giá sản phẩm không được nhỏ hơn 0'),
  product: z.string().min(1, 'Sản phẩm không được để trống')
})

export type TCreateProductSchema = z.infer<typeof createProductSchema>
export type TUpdateProductSchema = z.infer<typeof updateProductSchema>
export type TCreateProductVariantSchema = z.infer<typeof createProductVariantSchema>
export type TUpdateProductVariantSchema = z.infer<typeof updateProductVariantSchema>
