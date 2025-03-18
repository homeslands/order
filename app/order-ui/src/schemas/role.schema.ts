import { z } from 'zod'

export const updateRoleSchema = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string(),
})

export const addPermissionSchema = z.object({
  role: z.string(),
  authorities: z.array(z.string()),
})

export type TUpdateRoleSchema = z.infer<typeof updateRoleSchema>
export type TAddPermissionSchema = z.infer<typeof addPermissionSchema>
