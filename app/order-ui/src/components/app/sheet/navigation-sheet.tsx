import { Separator, Sheet, SheetContent, SheetTrigger } from '@/components/ui'
import { ROUTE } from '@/constants'
import { AlignJustifyIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

export default function NavigationSheet() {
  const { t } = useTranslation('sidebar')

  return (
    <Sheet>
      <SheetTrigger asChild>
        <AlignJustifyIcon className="h-7 w-7 cursor-pointer transition-colors hover:text-primary lg:hidden" />
      </SheetTrigger>
      <SheetContent className="w-[60%] py-5" side={'left'}>
        <div>
          <div className="flex flex-col items-start justify-center gap-6 px-6 pb-4">
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
            <NavLink
              to={ROUTE.ABOUT}
              className={({ isActive }) =>
                `flex items-center gap-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`
              }
            >
              <span className="text-sm">{t('header.aboutUs')}</span>
            </NavLink>
            <NavLink
              to={ROUTE.POLICY}
              className={({ isActive }) =>
                `flex items-center gap-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`
              }
            >
              <span className="text-sm">{t('header.policy')}</span>
            </NavLink>
          </div>
          <Separator />
          {/* <ModeToggle /> */}
        </div>
      </SheetContent>
    </Sheet>
  )
}
