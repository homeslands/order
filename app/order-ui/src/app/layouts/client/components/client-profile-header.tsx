import { NavLink, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  DropdownClientHeader,
  SelectBranchDropdown,
  SettingsDropdown,
} from '@/components/app/dropdown'
import { useAuthStore } from '@/stores'
import { ROUTE } from '@/constants'
import { Button } from '@/components/ui'
import { NavigationSheet } from '@/components/app/sheet'
import { useIsMobile } from '@/hooks'

export function ClientProfileHeader() {
  const navigate = useNavigate()
  const { t } = useTranslation('sidebar')
  const isMobile = useIsMobile()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <header
      className={`sticky top-0 z-30 w-full bg-white text-muted-foreground dark:bg-black`}
    >
      <div className="container">
        <div className="flex items-center justify-between w-full h-14">
          {/* Left content*/}
          <div className="flex items-center gap-1">
            {!isMobile && <NavigationSheet />}
            <Button variant="outline" className="flex items-center justify-center w-8 h-8 rounded-full" onClick={() => navigate(-1)} size="icon">
              <ArrowLeft />
            </Button>
          </div>

          {/* center content */}
          <div className="flex-row items-center justify-center hidden gap-6 lg:flex">
            <NavLink
              to={ROUTE.HOME}
              className={({ isActive }) =>
                `flex items-center gap-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`
              }
            >
              <span className="text-sm">{t('header.home')}</span>
            </NavLink>
            <NavLink
              to={ROUTE.CLIENT_MENU}
              className={({ isActive }) =>
                `flex items-center gap-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`
              }
            >
              <span className="text-sm">{t('header.menu')}</span>
            </NavLink>
            <NavLink
              to={ROUTE.CLIENT_GIFT_CARD}
              className={({ isActive }) =>
                `flex items-center gap-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`
              }
            >
              <span className="text-sm">{t('header.giftCard')}</span>
            </NavLink>
            {!isAuthenticated() && (
              <NavLink
                to={ROUTE.CLIENT_ORDERS_PUBLIC}
                className={({ isActive }) =>
                  `flex items-center gap-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`
                }
              >
                <span className="text-sm">{t('header.myOrders')}</span>
              </NavLink>
            )}
          </div>

          {/* Right content - Không có Cart */}
          <div className="flex items-center justify-end gap-2">
            {!isMobile && (
              <div className="flex items-center gap-2">
                {/* Settings */}
                <SettingsDropdown />

                {/* Select branch */}
                <SelectBranchDropdown />

                {/* Login + Profile */}
                <DropdownClientHeader />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

