import React from 'react'

export interface ISidebarRoute {
  title: string
  path: string
  icon?: React.ComponentType
  isActive?: boolean
  permission?: string 
  children?: ISidebarRoute[]
}
