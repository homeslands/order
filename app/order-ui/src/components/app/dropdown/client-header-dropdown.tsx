import { NavLink, useNavigate } from 'react-router-dom'
import { Inbox, LogIn, User } from 'lucide-react'
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
import { LogoutDialog, UseGiftCardDialog } from '@/components/app/dialog'
import { ROUTE } from '@/constants'
import { useAuthStore } from '@/stores'

export default function ClientHeaderDropdown() {
  const { t } = useTranslation(['sidebar'])
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  if (!isAuthenticated())
    return (
      <Button
        variant="default"
        className="flex items-center gap-1 px-2 py-1 text-[13px]"
        onClick={() => navigate(ROUTE.LOGIN)}
      >
        <LogIn />
        {t('header.login')}
      </Button>
    )
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full">
          <ProfileAvatar />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>
          <span>{t('header.myProfile')}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="h-9 px-0">
            <NavLink
              to={`${ROUTE.CLIENT_PROFILE}?tab=info`}
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
          <DropdownMenuItem className="h-9 px-0">
            <NavLink
              to={`${ROUTE.CLIENT_PROFILE}?tab=history`}
              className="flex h-9 w-full justify-start"
            >
              <Button
                variant="ghost"
                className="flex w-full justify-start gap-1 text-sm"
              >
                <Inbox className="icon" />
                {t('header.myOrders')}
              </Button>
            </NavLink>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <UseGiftCardDialog />
        <DropdownMenuSeparator />
        <LogoutDialog />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
