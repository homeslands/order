import { z } from 'zod'


export const updateCoinPolicySchema = z.object({
  slug: z.string(),
  value: z.string(),
})

export type TUpdateCoinPolicySchema = z.infer<typeof updateCoinPolicySchema>
