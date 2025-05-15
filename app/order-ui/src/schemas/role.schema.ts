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

export const createRoleSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
})

export type TUpdateRoleSchema = z.infer<typeof updateRoleSchema>
export type TAddPermissionSchema = z.infer<typeof addPermissionSchema>
export type TCreateRoleSchema = z.infer<typeof createRoleSchema>
