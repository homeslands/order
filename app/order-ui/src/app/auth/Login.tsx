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
import { sidebarRoutes } from '@/router/routes'
import { jwtDecode } from 'jwt-decode'
import { IToken } from '@/types'

export default function Login() {
  const { t } = useTranslation(['auth'])
  const { isAuthenticated, token } = useAuthStore()
  const { userInfo } = useUserStore()
  const { currentUrl, clearUrl } = useCurrentUrlStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated() && !_.isEmpty(userInfo) && token) {
      let urlNavigate = ROUTE.HOME;
      const decoded: IToken = jwtDecode(token);
      if (!decoded.scope) return;

      const scope = typeof decoded.scope === "string" ? JSON.parse(decoded.scope) : decoded.scope;
      const permissions = scope.permissions || [];

      if (currentUrl) {
        // Kiểm tra quyền truy cập currentUrl
        if (userInfo.role.name === Role.CUSTOMER) {
          // Customer không được phép truy cập route /system
          urlNavigate = !currentUrl.includes('/system') ? currentUrl : ROUTE.HOME;
        } else {
          const route = sidebarRoutes.find(route => currentUrl.includes(route.path));
          if (route && permissions.includes(route.permission)) {
            urlNavigate = currentUrl;
          } else {
            // Tìm route đầu tiên mà user có quyền truy cập trong sidebarRoutes
            const firstAllowedRoute = sidebarRoutes.find(route => permissions.includes(route.permission));
            urlNavigate = firstAllowedRoute ? firstAllowedRoute.path : ROUTE.HOME;
          }
        }
      } else {
        // Nếu không có currentUrl, tìm route đầu tiên mà user có quyền truy cập
        if (userInfo?.role && userInfo?.role?.name === Role.CUSTOMER) {
          urlNavigate = ROUTE.HOME;
        } else {
          const firstAllowedRoute = sidebarRoutes.find(route => permissions.includes(route.permission));
          urlNavigate = firstAllowedRoute ? firstAllowedRoute.path : ROUTE.HOME;
        }
      }

      navigate(urlNavigate, { replace: true });
      setTimeout(() => {
        clearUrl();
      }, 1000);
    }
  }, [isAuthenticated, navigate, userInfo, currentUrl, clearUrl, token])

  return (
    <div className="flex relative justify-center items-center min-h-screen">
      <img
        src={LoginBackground}
        className="object-cover absolute top-0 left-0 w-full h-full sm:object-fill"
      />

      <div className="flex relative z-10 justify-center items-center w-full h-full">
        <Card className="min-w-[22rem] border border-muted-foreground bg-white bg-opacity-10 shadow-xl backdrop-blur-xl sm:min-w-[24rem]">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-white">
              {t('login.welcome')}{' '}
            </CardTitle>
            <CardDescription className="text-center text-white">
              {t('login.description')}{' '}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
          <CardFooter className="flex gap-1 justify-between text-white">
            <div className="flex gap-1">
              <span className="text-xs sm:text-sm">{t('login.noAccount')}</span>
              <NavLink
                to={ROUTE.REGISTER}
                className="text-xs text-center text-primary sm:text-sm"
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
