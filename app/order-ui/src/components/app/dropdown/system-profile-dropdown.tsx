import { NavLink } from 'react-router-dom'
import { LogIn, ShoppingBag, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui'
import { ProfileAvatar } from '@/components/app/avatar'
import { LogoutDialog } from '@/components/app/dialog'
import { Role, ROUTE } from '@/constants'
import { useAuthStore, useUserStore } from '@/stores'

export default function SystemProfileDropdown() {
  const { t } = useTranslation(['sidebar'])
  const { isAuthenticated } = useAuthStore()
  const { userInfo } = useUserStore()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex cursor-pointer items-center gap-2">
          <ProfileAvatar />
          <span className="text-sm font-semibold">
            {userInfo?.firstName} {userInfo?.lastName}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>
          <span>{t('header.myProfile')}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="h-9 px-0">
            <NavLink
              to={`${ROUTE.STAFF_PROFILE}`}
              className="flex h-9 w-full justify-start"
            >
              <Button
                variant="ghost"
                className="flex w-full justify-start gap-1 text-sm"
              >
                <User className="icon" />
                {t('header.profile')}
              </Button>
            </NavLink>
          </DropdownMenuItem>
          {userInfo?.role.name === Role.CUSTOMER && (
            <DropdownMenuItem className="h-9 px-0">
              <NavLink
                to={`${ROUTE.CLIENT_ORDER_HISTORY}`}
                className="flex h-9 w-full justify-start"
              >
                <Button
                  variant="ghost"
                  className="flex w-full justify-start gap-1 text-sm"
                >
                  <ShoppingBag className="icon" />
                  {t('header.myOrders')}
                </Button>
              </NavLink>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {isAuthenticated() ? (
          <LogoutDialog />
        ) : (
          <NavLink to={ROUTE.LOGIN}>
            <Button
              variant="ghost"
              className="flex w-full items-center justify-start gap-2"
            >
              <LogIn />
              {t('header.login')}
            </Button>
          </NavLink>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
