import { memo, useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { Gift, Home, ShoppingCart, SquareMenu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib'
import { ROUTE } from '@/constants'
import { useOrderFlowStore } from '@/stores'

export const BottomBar = memo(function BottomBar() {
  // const location = useLocation()
  const { t } = useTranslation('sidebar')

  const orderingItems = useOrderFlowStore((state) => state.orderingData?.orderItems)

  const cartItemCount = useMemo(
    () => orderingItems?.reduce((total, item) => total + item.quantity, 0) || 0,
    [orderingItems],
  )

  // base tab style
  const tabBase =
    'inline-flex flex-col items-center justify-center gap-1 whitespace-nowrap rounded-full py-2 px-4 transition-all duration-300'

  // icon wrapper base
  const iconBase =
    'flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300'

  // active style cho icon và text
  const iconActive = 'bg-primary text-white'
  const textActive = 'text-muted-foreground font-bold'

  // inactive style
  const iconInactive = 'text-muted-foreground/70'
  const textInactive = 'text-muted-foreground/80'

  return (
    <div
      // className={cn(
      //   'fixed bottom-4 left-1/2 -translate-x-1/2 z-50',
      //   'w-[92%] max-w-md p-2 rounded-full',
      //   // hiệu ứng liquid glass nhẹ
      //   'bg-white/10 dark:bg-neutral-900/40 backdrop-blur-xl backdrop-saturate-150',
      //   'border border-white/20 dark:border-neutral-700',
      // )}
      className={cn(
        'fixed bottom-4 left-1/2 -translate-x-1/2 z-50',
        'w-[92%] max-w-md p-2 rounded-full',
        // hiệu ứng liquid glass nhẹ
        'bg-white shadow-xl shadow-black/10',
      )}
    >
      <div className="grid grid-cols-4 items-center justify-items-center h-14">
        {/* Home */}
        <NavLink
          to={ROUTE.HOME}
          className={({ isActive }) =>
            cn(tabBase, isActive && textActive)
          }
        >
          {({ isActive }) => (
            <>
              <div className={cn(iconBase, isActive ? iconActive : iconInactive)}>
                <Home className="w-5 h-5" />
              </div>
              <span className={cn('text-[0.6rem] leading-none', isActive ? textActive : textInactive)}>
                {t('bottombar.home')}
              </span>
            </>
          )}
        </NavLink>

        {/* Menu */}
        <NavLink
          to={ROUTE.CLIENT_MENU}
          className={({ isActive }) =>
            cn(tabBase, isActive && textActive)
          }
        >
          {({ isActive }) => (
            <>
              <div className={cn(iconBase, isActive ? iconActive : iconInactive)}>
                <SquareMenu className="w-5 h-5" />
              </div>
              <span className={cn('text-[0.6rem] leading-none', isActive ? textActive : textInactive)}>
                {t('bottombar.menu')}
              </span>
            </>
          )}
        </NavLink>

        {/* Cart */}
        <NavLink
          to={ROUTE.CLIENT_CART}
          className={({ isActive }) =>
            cn('relative', tabBase, isActive && textActive)
          }
        >
          {({ isActive }) => (
            <>
              <div className={cn(iconBase, isActive ? iconActive : iconInactive)}>
                <ShoppingCart className="w-5 h-5" />
              </div>
              <span className={cn('text-[0.6rem] leading-none', isActive ? textActive : textInactive)}>
                {t('bottombar.cart')}
              </span>

              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 flex justify-center items-center w-6 h-6 text-xs font-semibold text-white rounded-full bg-primary shadow-sm shadow-primary/40">
                  {cartItemCount}
                </span>
              )}
            </>
          )}
        </NavLink>

        {/* Gift */}
        <NavLink
          to={ROUTE.CLIENT_GIFT_CARD}
          className={({ isActive }) =>
            cn(tabBase, isActive && textActive)
          }
        >
          {({ isActive }) => (
            <>
              <div className={cn(iconBase, isActive ? iconActive : iconInactive)}>
                <Gift className="w-5 h-5" />
              </div>
              <span className={cn('text-[0.6rem] leading-none', isActive ? textActive : textInactive)}>
                {t('bottombar.giftCard')}
              </span>
            </>
          )}
        </NavLink>
      </div>
    </div>
  )
})
