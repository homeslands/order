import { RevenueTypeQuery } from '@/constants'
import { z } from 'zod'

export const exportRevenueSchema = z.object({
  branch: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  type: z.nativeEnum(RevenueTypeQuery),
})

export type TExportRevenueSchema = z.infer<typeof exportRevenueSchema>
