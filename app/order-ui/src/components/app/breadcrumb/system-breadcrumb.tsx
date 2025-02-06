import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui'
import { useUserStore } from '@/stores'
import { Role, ROUTE } from '@/constants'

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
  const { userInfo } = useUserStore()

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
            {userInfo?.role.name === Role.CUSTOMER ? (
              <Link to="/">{t('route.home')}</Link>
            ) : (
              <Link to={ROUTE.OVERVIEW}>{t('route.home')}</Link>
            )}
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
