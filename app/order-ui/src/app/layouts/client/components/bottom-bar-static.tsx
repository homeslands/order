import { memo, useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { Gift, Home, ShoppingCart, SquareMenu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib'
import { ROUTE } from '@/constants'
import { useOrderFlowStore } from '@/stores'

export const BottomBarStatic = memo(function BottomBarStatic() {
    const { t } = useTranslation('sidebar')
    const orderingItems = useOrderFlowStore((state) => state.orderingData?.orderItems)

    const cartItemCount = useMemo(
        () => orderingItems?.reduce((total, item) => total + item.quantity, 0) || 0,
        [orderingItems],
    )

    const tabBase =
        'inline-flex flex-col items-center justify-center gap-2 whitespace-nowrap rounded-full py-2 px-4 transition-all duration-300'
    const iconBase =
        'flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300'
    const iconActive = 'text-primary'
    const textActive = 'text-primary font-bold'
    const iconInactive = 'text-muted-foreground/70'
    const textInactive = 'text-muted-foreground/80'

    return (
        <div
            className={cn(
                'fixed bottom-0 left-0 right-0 z-20',
                'w-full border-t border-border bg-background shadow-inner shadow-black/5',
            )}
        >
            <div className="grid grid-cols-4 items-center justify-items-center h-20">
                {/* Home */}
                <NavLink
                    to={ROUTE.HOME}
                    className={({ isActive }) => cn(tabBase, isActive && textActive)}
                >
                    {({ isActive }) => (
                        <>
                            <div className={cn(iconBase, isActive ? iconActive : iconInactive)}>
                                <Home className="w-5 h-5" />
                            </div>
                            <span
                                className={cn('text-[0.7rem] leading-none', isActive ? textActive : textInactive)}
                            >
                                {t('bottombar.home')}
                            </span>
                        </>
                    )}
                </NavLink>

                {/* Menu */}
                <NavLink
                    to={ROUTE.CLIENT_MENU}
                    className={({ isActive }) => cn(tabBase, isActive && textActive)}
                >
                    {({ isActive }) => (
                        <>
                            <div className={cn(iconBase, isActive ? iconActive : iconInactive)}>
                                <SquareMenu className="w-5 h-5" />
                            </div>
                            <span
                                className={cn('text-[0.7rem] leading-none', isActive ? textActive : textInactive)}
                            >
                                {t('bottombar.menu')}
                            </span>
                        </>
                    )}
                </NavLink>

                {/* Cart */}
                <NavLink
                    to={ROUTE.CLIENT_CART}
                    className={({ isActive }) => cn('relative', tabBase, isActive && textActive)}
                >
                    {({ isActive }) => (
                        <>
                            <div className={cn(iconBase, isActive ? iconActive : iconInactive)}>
                                <ShoppingCart className="w-5 h-5" />
                            </div>
                            <span
                                className={cn('text-[0.7rem] leading-none', isActive ? textActive : textInactive)}
                            >
                                {t('bottombar.cart')}
                            </span>

                            {cartItemCount > 0 && (
                                <span className="absolute top-1 -right-1 flex justify-center items-center w-6 h-6 text-xs font-semibold text-white rounded-full bg-primary shadow-sm shadow-primary/40">
                                    {cartItemCount}
                                </span>
                            )}
                        </>
                    )}
                </NavLink>

                {/* Gift */}
                <NavLink
                    to={ROUTE.CLIENT_GIFT_CARD}
                    className={({ isActive }) => cn(tabBase, isActive && textActive)}
                >
                    {({ isActive }) => (
                        <>
                            <div className={cn(iconBase, isActive ? iconActive : iconInactive)}>
                                <Gift className="w-5 h-5" />
                            </div>
                            <span
                                className={cn('text-[0.7rem] leading-none', isActive ? textActive : textInactive)}
                            >
                                {t('bottombar.giftCard')}
                            </span>
                        </>
                    )}
                </NavLink>
            </div>
        </div>
    )
})
