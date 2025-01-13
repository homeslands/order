import React from 'react'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

const routeNameMap: { [key: string]: string } = {
  orders: 'orders',
  payment: 'payment',
  tracking: 'tracking',
  staff: 'staff',
  menu: 'menu',
  products: 'products',
  tables: 'tables',
  users: 'users',
  catalog: 'catalog',
  branch: 'branch',
  settings: 'settings',
}

export default function SystemBreadcrumb() {
  const location = useLocation()
  const { t } = useTranslation(['route'])

  // Filter out empty segments and clean up path
  const pathnames = location.pathname.split('/').filter((x) => x && x !== 'app')

  const getBreadcrumbText = (name: string) => {
    const key = name.toLowerCase()
    if (routeNameMap[key]) {
      return t(`route.${routeNameMap[key]}`)
    }

    // Handle dynamic segments (IDs, slugs etc)
    if (name.match(/^[0-9a-f-]+$/)) {
      return t('route.details')
    }

    return t(`route.${key}`, { defaultValue: name })
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink asChild>
            <Link to="/">{t('route.home')}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`
          const isLast = index === pathnames.length - 1
          return (
            <React.Fragment key={name}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{getBreadcrumbText(name)}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={routeTo}>{getBreadcrumbText(name)}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
