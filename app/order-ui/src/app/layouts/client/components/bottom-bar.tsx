import { NavLink, useLocation } from 'react-router-dom'
import { Gift, Home, ShoppingBag, ShoppingCart, SquareMenu } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib'
import { Role, ROUTE } from '@/constants'
import { useAuthStore, useCartItemStore, useUserStore } from '@/stores'

export function BottomBar() {
  const location = useLocation()
  const { t } = useTranslation('sidebar')
  const { userInfo } = useUserStore()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const { getCartItems } = useCartItemStore()
  return (
    <div className="fixed bottom-0 left-0 z-50 my-auto h-16 w-full bg-white dark:bg-black">
      <div className="mx-auto grid h-full max-w-lg grid-cols-5 p-2">
        <NavLink
          to={ROUTE.HOME}
          className={cn(
            'inline-flex flex-col items-center justify-center gap-1 whitespace-nowrap rounded-md px-5',
            location.pathname === ROUTE.CLIENT_HOME && 'text-primary',
          )}
        >
          <Home className="h-5 w-5" />
          <span className="text-[0.5rem]">{t('bottombar.home')}</span>
        </NavLink>

        <NavLink
          to={ROUTE.CLIENT_MENU}
          className={cn(
            'inline-flex flex-col items-center justify-center gap-1 whitespace-nowrap rounded-md px-5',
            location.pathname.includes(ROUTE.CLIENT_MENU) && 'text-primary',
          )}
        >
          <SquareMenu className="h-5 w-5" />
          <span className="text-[0.5rem]">{t('bottombar.menu')}</span>
        </NavLink>

        {/* <NavLink
                    to={`${ROUTE.CLIENT_PROFILE}?tab=notification`}
                    className={cn(
                        "inline-flex flex-col items-center gap-1 justify-center px-5",
                        (location.pathname.includes(`${ROUTE.CLIENT_PROFILE}`) && location.search.includes('notification')) && "text-primary"
                    )}
                >
                    <Bell className="w-5 h-5" />
                    <span className="text-[0.5rem]">
                        {t('bottombar.notification')}
                    </span>
                </NavLink> */}

        {isAuthenticated() &&
        userInfo &&
        userInfo?.role &&
        userInfo?.role?.name === Role.CUSTOMER ? (
          <NavLink
            to={`${ROUTE.CLIENT_PROFILE}?tab=history`}
            className={`relative inline-flex flex-col items-center justify-center gap-1 whitespace-nowrap rounded-md px-5 ${location.pathname.includes(`${ROUTE.CLIENT_PROFILE}`) && location.search.includes('order') ? 'text-primary' : ''}`}
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="text-[0.5rem]">{t('bottombar.order')}</span>
          </NavLink>
        ) : (
          <NavLink
            to={ROUTE.CLIENT_ORDERS_PUBLIC}
            className={`relative inline-flex flex-col items-center justify-center gap-1 rounded-md px-5 ${location.pathname.includes(`${ROUTE.CLIENT_ORDERS_PUBLIC}`) ? 'text-primary' : ''}`}
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="text-[0.5rem]">{t('bottombar.order')}</span>
          </NavLink>
        )}
        {/* Cart */}
        <NavLink
          to={ROUTE.CLIENT_CART}
          className={`relative inline-flex flex-col items-center justify-center gap-1 whitespace-nowrap rounded-md px-5 ${location.pathname.includes(`${ROUTE.CLIENT_CART}`) ? 'text-primary' : ''} ${getCartItems()?.orderItems?.length ? 'bg-primary/10 text-primary' : ''}`}
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="text-[0.5rem]">{t('bottombar.cart')}</span>
          {getCartItems()?.orderItems?.length ? (
            <span className="absolute right-4 top-1 flex h-5 w-5 -translate-y-1/2 translate-x-1/2 transform items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              {getCartItems()?.orderItems.length}
            </span>
          ) : null}
        </NavLink>

        <NavLink
          to={ROUTE.CLIENT_GIFT_CARD}
          className={cn(
            'inline-flex flex-col items-center justify-center gap-1 whitespace-nowrap rounded-md px-5',
            location.pathname.includes(ROUTE.CLIENT_GIFT_CARD) &&
              'text-primary',
          )}
        >
          <Gift className="h-5 w-5" />
          <span className="text-[0.5rem]">{t('bottombar.giftCard')}</span>
        </NavLink>
      </div>
    </div>
  )
}
