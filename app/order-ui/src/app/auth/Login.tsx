import { useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import _ from 'lodash'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui'
import { LoginBackground } from '@/assets/images'
import { LoginForm } from '@/components/app/form'
import { useAuthStore, useUserStore } from '@/stores'
import { Role, ROUTE } from '@/constants'

export default function Login() {
  const { t } = useTranslation(['auth'])
  const { isAuthenticated } = useAuthStore()
  const { userInfo } = useUserStore()

  const navigate = useNavigate()

  // Redirect if the user is already authenticated
  useEffect(() => {
    if (isAuthenticated() && !_.isEmpty(userInfo)) {
      switch (userInfo.role.name) {
        case Role.STAFF:
        case Role.CHEF:
        case Role.MANAGER:
        case Role.ADMIN:
        case Role.SUPER_ADMIN:
          navigate(ROUTE.OVERVIEW, { replace: true })
          break
        default:
          navigate(ROUTE.HOME, { replace: true })
          break
      }
    }
  }, [isAuthenticated, navigate, userInfo])

  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <img
        src={LoginBackground}
        className="absolute left-0 top-0 h-full w-full object-cover sm:object-fill"
      />

      <div className="relative z-10 flex h-full w-full items-center justify-center">
        <Card className="min-w-[22rem] border border-muted-foreground bg-white bg-opacity-10 shadow-xl backdrop-blur-xl sm:min-w-[24rem]">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-white">
              {t('login.welcome')}{' '}
            </CardTitle>
            <CardDescription className="text-center text-white">
              {t('login.description')}{' '}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
          <CardFooter className="flex justify-between gap-1 text-white">
            <div className="flex gap-1">
              <span className="text-xs sm:text-sm">{t('login.noAccount')}</span>
              <NavLink
                to={ROUTE.REGISTER}
                className="text-center text-xs text-primary sm:text-sm"
              >
                {t('login.register')}
              </NavLink>
            </div>
            <NavLink
              to={ROUTE.FORGOT_PASSWORD}
              className="text-xs text-primary sm:text-sm"
            >
              {t('login.forgotPassword')}
            </NavLink>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
