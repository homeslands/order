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
        <div className="flex gap-2 items-center cursor-pointer">
          <ProfileAvatar />
          <span className="hidden text-sm font-semibold xl:block">
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
          <DropdownMenuItem className="px-0 h-9">
            <NavLink
              to={`${ROUTE.STAFF_PROFILE}`}
              className="flex justify-start w-full h-9"
            >
              <Button
                variant="ghost"
                className="flex gap-1 justify-start w-full text-sm"
              >
                <User className="icon" />
                {t('header.profile')}
              </Button>
            </NavLink>
          </DropdownMenuItem>
          {userInfo?.role.name === Role.CUSTOMER && (
            <DropdownMenuItem className="px-0 h-9">
              <NavLink
                to={`${ROUTE.CLIENT_ORDER_HISTORY}`}
                className="flex justify-start w-full h-9"
              >
                <Button
                  variant="ghost"
                  className="flex gap-1 justify-start w-full text-sm"
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
              className="flex gap-2 justify-start items-center w-full"
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
