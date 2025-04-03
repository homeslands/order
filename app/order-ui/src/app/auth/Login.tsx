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
import { useAuthStore, useCurrentUrlStore, useUserStore } from '@/stores'
import { Role, ROUTE } from '@/constants'
//import { sidebarRoutes } from '@/router/routes'

export default function Login() {
  const { t } = useTranslation(['auth'])
  const { isAuthenticated } = useAuthStore()
  const { userInfo } = useUserStore()
  const { currentUrl, clearUrl } = useCurrentUrlStore()

  const navigate = useNavigate()

  // Redirect if the user is already authenticated
  useEffect(() => {
    if (isAuthenticated() && !_.isEmpty(userInfo)) {
      let urlNavigate = ROUTE.HOME;
      // if (currentUrl) {
      //   if (!currentUrl.includes('/system')) {
      //     urlNavigate = userInfo.role.name === Role.CUSTOMER ? currentUrl : ROUTE.HOME
      //   }else{
      //     // kiểm tra xem route có trong sidebarRoutes không? >nếu có thì kiểm tra xem route có thuộc về userInfo.role.name không? >nếu có thì urlNavigate = currentUrl >nếu không thì urlNavigate = ROUTE.OVERVIEW
      //     const route = sidebarRoutes.find(route => route.path === currentUrl)
      //     if (route) {
      //       // if (route.permission.includes(userInfo.role.permissions)) {
      //       //   urlNavigate = currentUrl
      //       // }
      //     }
      //   }
      // }
      switch (userInfo.role.name) {
        case Role.MANAGER:
        case Role.ADMIN:
        case Role.SUPER_ADMIN:
          if (currentUrl && currentUrl.includes('/system')) {
            urlNavigate = currentUrl
          } else {
            urlNavigate = ROUTE.OVERVIEW
          }
          break
        case Role.CHEF:
          if (currentUrl && currentUrl.includes('/system')) {
            urlNavigate = currentUrl
          } else {
            urlNavigate = ROUTE.STAFF_CHEF_ORDER
          }
          break
        case Role.STAFF:
          if (currentUrl && currentUrl.includes('/system')) {
            urlNavigate = currentUrl
          } else {
            urlNavigate = ROUTE.STAFF_ORDER_MANAGEMENT
          }
          break
        default:
          if (currentUrl && !currentUrl.includes('/system')) {
            urlNavigate = currentUrl
          }
          break
      }
      navigate(urlNavigate, { replace: true })
      setTimeout(() => {
        clearUrl()
      }, 1000)
    }

  }, [isAuthenticated, navigate, userInfo, currentUrl, clearUrl])

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
