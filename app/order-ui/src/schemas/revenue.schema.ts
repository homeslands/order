import { z } from 'zod'
import { useTranslation } from 'react-i18next'

import { RevenueTypeQuery } from '@/constants'

export function useExportRevenueSchema() {
  const { t: tRevenue } = useTranslation(['revenue'])
  return z
    .object({
      branch: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      type: z.nativeEnum(RevenueTypeQuery),
    })
    .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
      message: tRevenue('revenue.endDateMustBeGreaterThanOrEqualToStartDate'),
      path: ['endDate'],
    })
}

export type TExportRevenueSchema = z.infer<
  ReturnType<typeof useExportRevenueSchema>
>
