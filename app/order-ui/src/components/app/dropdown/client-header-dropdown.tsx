import { NavLink, useNavigate } from 'react-router-dom'
import { Archive, Inbox, LogIn, User } from 'lucide-react'
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
import { useIsMobile } from '@/hooks'

export default function ClientHeaderDropdown() {
  const { t } = useTranslation(['sidebar'])
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
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
          <DropdownMenuItem className="px-0 h-9">
            <NavLink
              to={isMobile ? ROUTE.CLIENT_PROFILE : ROUTE.CLIENT_PROFILE_INFO}
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
          <DropdownMenuItem className="px-0 h-9">
            <NavLink
              to={ROUTE.CLIENT_PROFILE_HISTORY}
              className="flex justify-start w-full h-9"
            >
              <Button
                variant="ghost"
                className="flex gap-1 justify-start w-full text-sm"
              >
                <Inbox className="icon" />
                {t('header.myOrders')}
              </Button>
            </NavLink>
          </DropdownMenuItem>
          <DropdownMenuItem className="px-0 h-9">
            <NavLink
              to={ROUTE.CLIENT_PROFILE_GIFT_CARD}
              className="flex justify-start w-full h-9"
            >
              <Button
                variant="ghost"
                className="flex gap-1 justify-start w-full text-sm"
              >
                <Archive className="icon" />
                {t('header.listGiftCard')}
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
