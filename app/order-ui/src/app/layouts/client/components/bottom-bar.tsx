import { NavLink, useLocation } from 'react-router-dom'
import { Bell, Home, SquareMenu, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib'
import { ROUTE } from '@/constants'

export function BottomBar() {
    const location = useLocation()
    const { t } = useTranslation('sidebar')
    return (
        <div className="fixed bottom-0 left-0 z-50 my-auto w-full h-16 bg-white dark:bg-black">
            <div className="grid grid-cols-4 mx-auto max-w-lg h-full">
                <NavLink
                    to={ROUTE.HOME}
                    className={cn(
                        "inline-flex flex-col items-center gap-1 justify-center px-5",
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
                        "inline-flex flex-col items-center gap-1 justify-center px-5",
                        location.pathname.includes(ROUTE.CLIENT_MENU) && "text-primary"
                    )}
                >
                    <SquareMenu className="w-5 h-5" />
                    <span className="text-[0.5rem]">
                        {t('bottombar.menu')}
                    </span>
                </NavLink>
                <NavLink
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
                </NavLink>
                <NavLink
                    to={`${ROUTE.CLIENT_PROFILE}?tab=info`}
                    className={cn(
                        "inline-flex flex-col items-center gap-1 justify-center px-5",
                        (location.pathname.includes(`${ROUTE.CLIENT_PROFILE}`) && location.search.includes('info')) && "text-primary"
                    )}
                >
                    <User className="w-5 h-5" />
                    <span className="text-[0.5rem]">
                        {t('bottombar.profile')}
                    </span>
                </NavLink>
            </div>
        </div>
    )
}
