import { PrinterDataType } from '@/constants'
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

export const createPrinterForChefAreaSchema = z.object({
  name: z.string().min(1),
  ip: z.string().min(1),
  port: z.string().min(1),
  dataType: z.enum([PrinterDataType.TSPL_ZPL, PrinterDataType.ESC_POS]),
  description: z.optional(z.string()),
  slug: z.string(), // This is the slug of the chef area
  
})

export const updatePrinterForChefAreaSchema = z.object({
  slug: z.string(), // This is the slug of the printer
  printerSlug: z.string(), // This is the slug of the printer
  name: z.string().min(1),
  ip: z.string().min(1),
  port: z.string().min(1),
  dataType: z.enum([PrinterDataType.TSPL_ZPL, PrinterDataType.ESC_POS]),
  description: z.optional(z.string()),
})

export type TCreateChefAreaSchema = z.infer<typeof createChefAreaSchema>
export type TUpdateChefAreaSchema = z.infer<typeof updateChefAreaSchema>
export type TAddProductToChefAreaSchema = z.infer<
  typeof addProductToChefAreaSchema
>
export type TUpdateProductInChefAreaSchema = z.infer<
  typeof updateProductInChefAreaSchema
  >

export type TCreatePrinterForChefAreaSchema = z.infer<
  typeof createPrinterForChefAreaSchema
>
export type TUpdatePrinterForChefAreaSchema = z.infer<  
  typeof updatePrinterForChefAreaSchema
>
