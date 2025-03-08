import React from 'react'

import { Role } from '@/constants'

export interface ISidebarRoute {
  title: string
  path: string
  icon?: React.ComponentType
  isActive?: boolean
  roles?: Role[]
  children?: ISidebarRoute[]
}
