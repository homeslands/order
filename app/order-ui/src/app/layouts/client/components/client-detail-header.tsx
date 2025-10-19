import { NavLink, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingCart } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  DropdownClientHeader,
  SelectBranchDropdown,
  SettingsDropdown,
} from '@/components/app/dropdown'
import { useAuthStore, useOrderFlowStore } from '@/stores'
import { ROUTE } from '@/constants'
import { Button } from '@/components/ui'
import { NavigationSheet } from '@/components/app/sheet'
import { useIsMobile } from '@/hooks'

export function ClientDetailHeader() {
  const navigate = useNavigate()
  const { t } = useTranslation('sidebar')
  const isMobile = useIsMobile()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const { getCartItems } = useOrderFlowStore()
  const cartItems = getCartItems()

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

          {/* Right content */}
          <div className="flex items-center justify-end gap-2">
            {/* Cart */}
            {!isMobile && (
              <div>
                <NavLink
                  to={ROUTE.CLIENT_CART}
                  className="relative flex items-center gap-2"
                >
                  <Button
                    variant="ghost"
                    className="relative text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  >
                    <ShoppingCart />
                    {cartItems?.orderItems?.length ? (
                      <span className="absolute flex items-center justify-center w-4 h-4 text-xs font-bold text-white transform translate-x-1/2 -translate-y-1/2 rounded-full top-2 right-2 bg-primary">
                        {cartItems.orderItems.reduce((total, item) => total + item.quantity, 0)}
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
            )}
            <NavLink to={ROUTE.CLIENT_CART} className="relative flex items-center gap-2 text-muted-foreground hover:bg-primary/10 hover:text-primary">
              <Button variant="outline" className="relative text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-full w-11 h-11">
                <ShoppingCart className="icon" />
                {cartItems?.orderItems?.length ? (
                  <span className="absolute -top-1.5 -right-2 flex justify-center items-center w-5 h-5 text-[0.6rem] font-semibold text-white rounded-full bg-primary shadow-sm shadow-primary/40">
                    {cartItems.orderItems.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                ) : null}
              </Button>
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  )
}
