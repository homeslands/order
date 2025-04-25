import { NavLink } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  DropdownClientHeader,
  SelectBranchDropdown,
  SettingsDropdown,
} from '@/components/app/dropdown'
import { useCartItemStore } from '@/stores'
import { Logo } from '@/assets/images'
import { ROUTE } from '@/constants'
import { Button } from '@/components/ui'
import { NavigationSheet } from '@/components/app/sheet'
import { useIsMobile } from '@/hooks'

export function ClientHeader() {
  const { t } = useTranslation('sidebar')
  const isMobile = useIsMobile()
  const { getCartItems } = useCartItemStore()
  return (
    <header className={`sticky top-0 z-30 w-full bg-white shadow-md text-muted-foreground dark:bg-black`}>
      <div className="container">
        <div className="flex justify-between items-center w-full h-14">
          {/* Left content*/}
          <div className="flex gap-1 items-center">
            {!isMobile && <NavigationSheet />}
            <NavLink to={ROUTE.HOME} className="flex gap-2 items-center">
              {<img src={Logo} alt="logo" className="h-8 w-fit" />}
            </NavLink>
          </div>

          {/* center content */}
          <div className="hidden flex-row gap-6 justify-center items-center lg:flex">
            <NavLink
              to={ROUTE.HOME}
              className={({ isActive }) =>
                `flex items-center gap-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`
              }
            >
              <span className="text-sm">
                {t('header.home')}
              </span>
            </NavLink>
            <NavLink
              to={ROUTE.CLIENT_MENU}
              className={({ isActive }) =>
                `flex items-center gap-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`
              }
            >
              <span className="text-sm">
                {t('header.menu')}
              </span>
            </NavLink>
            <NavLink
              to={ROUTE.ABOUT}
              className={({ isActive }) =>
                `flex items-center gap-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`
              }
            >
              <span className="text-sm">
                {t('header.aboutUs')}
              </span>
            </NavLink>
            <NavLink
              to={ROUTE.POLICY}
              className={({ isActive }) =>
                `flex items-center gap-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`
              }
            >
              <span className="text-sm">
                {t('header.policy')}
              </span>
            </NavLink>
            <NavLink
              to={ROUTE.SECURITY}
              className={({ isActive }) =>
                `flex items-center gap-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`
              }
            >
              <span className="text-sm">
                {t('header.securityTerm')}
              </span>
            </NavLink>
          </div>

          {/* Right content */}
          <div className="flex gap-2 justify-end items-center">
            {/* Cart */}
            <NavLink
              to={ROUTE.CLIENT_CART}
              className="flex relative gap-2 items-center"
            >
              <Button
                variant="ghost"
                className="relative text-muted-foreground hover:bg-primary/10 hover:text-primary"
              >
                <ShoppingCart />
                {getCartItems()?.orderItems?.length ? (
                  <span className="flex absolute top-2 right-2 justify-center items-center w-4 h-4 text-xs font-bold text-white rounded-full transform translate-x-1/2 -translate-y-1/2 bg-primary">
                    {getCartItems()?.orderItems.length}
                  </span>
                ) : null}
              </Button>
            </NavLink>

            {/* Settings */}
            <SettingsDropdown />

            {/* Select branch */}
            <SelectBranchDropdown />

            {/* Login + Profile */}
            <DropdownClientHeader />
          </div>
        </div>
      </div>
    </header>
  )
}
