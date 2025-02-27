import { TableStatus } from '@/constants'
import { z } from 'zod'

export const createTableSchema = z.object({
  name: z.string().min(1),
  branch: z.string().min(1),
  location: z.optional(z.string()),
  status: z.enum([TableStatus.AVAILABLE, TableStatus.RESERVED]),
})

export const updateTableSchema = z.object({
  slug: z.string(),
  name: z.string().min(1),
  location: z.optional(z.string()),
})

export type TCreateTableSchema = z.infer<typeof createTableSchema>
export type TUpdateTableSchema = z.infer<typeof updateTableSchema>
