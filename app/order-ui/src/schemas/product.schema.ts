import { useTranslation } from 'react-i18next'
import { z } from 'zod'

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Tên sản phẩm không được để trống')
    .max(255, 'Tên sản phẩm không được quá 255 ký tự'),
  description: z.optional(z.string()),
  isLimit: z.boolean(),
  isTopSell: z.boolean(),
  isNew: z.boolean(),
  isCombo: z.boolean(),
  isGift: z.boolean(),
  catalog: z.string().min(1, 'Danh mục không được để trống'),
})

export const updateProductSchema = z.object({
  slug: z.string().min(1, 'Slug không được để trống'),
  name: z
    .string()
    .min(1, 'Tên sản phẩm không được để trống')
    .max(255, 'Tên sản phẩm không được quá 255 ký tự'),
  description: z.optional(z.string()),
  isLimit: z.boolean(),
  isActive: z.optional(z.boolean()),
  isTopSell: z.boolean(),
  isNew: z.boolean(),
  isCombo: z.boolean(),
  isGift: z.boolean(),
  catalog: z.string().min(1, 'Danh mục không được để trống'),
})

export function useCreateProductVariantSchema() {
  const { t } = useTranslation(['product'])
  return z.object({
    price: z.coerce
      .number({
        required_error: t('product.priceRequired'),
        invalid_type_error: t('product.priceInvalid'),
      })
      .min(0, t('product.priceMin')),
    size: z.string().min(1, t('product.sizeRequired')),
    product: z.string().min(1, t('product.productRequired')),
  })
}

export function useUpdateProductVariantSchema() {
  const { t } = useTranslation(['product'])
  return z.object({
    price: z.coerce
      .number({
        required_error: t('product.priceRequired'),
        invalid_type_error: t('product.priceInvalid'),
      })
      .min(0, t('product.priceMin')),
    product: z.string().min(1, t('product.productRequired')),
  })
}

export type TCreateProductSchema = z.infer<typeof createProductSchema>
export type TUpdateProductSchema = z.infer<typeof updateProductSchema>
export type TCreateProductVariantSchema = z.infer<
  ReturnType<typeof useCreateProductVariantSchema>
>
export type TUpdateProductVariantSchema = z.infer<
  ReturnType<typeof useUpdateProductVariantSchema>
>
