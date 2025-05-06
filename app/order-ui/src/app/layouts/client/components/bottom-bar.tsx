import { NavLink, useLocation } from 'react-router-dom'
import { Home, ShoppingBag, ShoppingCart, SquareMenu } from 'lucide-react'
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
        <div className="fixed bottom-0 left-0 z-50 my-auto w-full h-16 bg-white dark:bg-black">
            <div className="grid grid-cols-4 p-2 mx-auto max-w-lg h-full">
                <NavLink
                    to={ROUTE.HOME}
                    className={cn(
                        "inline-flex rounded-md flex-col items-center gap-1 justify-center px-5",
                        location.pathname === ROUTE.CLIENT_HOME && "text-primary"
                    )}
                >
                    <Home className="w-5 h-5" />
                    <span className="text-[0.5rem]">
                        {t('bottombar.home')}
                    </span>
                </NavLink>

                <NavLink
                    to={ROUTE.CLIENT_MENU}
                    className={cn(
                        "inline-flex rounded-md flex-col items-center gap-1 justify-center px-5",
                        location.pathname.includes(ROUTE.CLIENT_MENU) && "text-primary"
                    )}
                >
                    <SquareMenu className="w-5 h-5" />
                    <span className="text-[0.5rem]">
                        {t('bottombar.menu')}
                    </span>
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

                {isAuthenticated() && userInfo && userInfo?.role && userInfo?.role?.name === Role.CUSTOMER ? (
                    <NavLink
                        to={`${ROUTE.CLIENT_PROFILE}?tab=history`}
                        className={`inline-flex rounded-md flex-col items-center gap-1 justify-center px-5 relative ${location.pathname.includes(`${ROUTE.CLIENT_PROFILE}`) && location.search.includes('order') ? 'text-primary' : ''}`}
                    >
                        <ShoppingBag className="w-5 h-5" />
                        <span className="text-[0.5rem]">
                            {t('bottombar.order')}
                        </span>
                    </NavLink>
                ) : (
                    <NavLink
                        to={ROUTE.CLIENT_ORDERS_PUBLIC}
                        className={`inline-flex rounded-md flex-col items-center gap-1 justify-center px-5 relative ${location.pathname.includes(`${ROUTE.CLIENT_ORDERS_PUBLIC}`) ? 'text-primary' : ''}`}
                    >
                        <ShoppingBag className="w-5 h-5" />
                        <span className="text-[0.5rem]">
                            {t('bottombar.order')}
                        </span>
                    </NavLink>

                )}
                {/* Cart */}
                <NavLink
                    to={ROUTE.CLIENT_CART}
                    className={`inline-flex rounded-md flex-col items-center gap-1 justify-center px-5 relative ${location.pathname.includes(`${ROUTE.CLIENT_PROFILE}`) && location.search.includes('order') ? 'text-primary' : ''} ${getCartItems()?.orderItems?.length ? 'bg-primary/10 text-primary' : ''}`}
                >
                    <ShoppingCart className="w-5 h-5" />
                    <span className="text-[0.5rem]">
                        {t('bottombar.cart')}
                    </span>
                    {getCartItems()?.orderItems?.length ? (
                        <span className="flex absolute top-1 right-4 justify-center items-center w-5 h-5 text-xs font-bold text-white rounded-full transform translate-x-1/2 -translate-y-1/2 bg-primary">
                            {getCartItems()?.orderItems.length}
                        </span>
                    ) : null}
                </NavLink>
            </div>
        </div>
    )
}
