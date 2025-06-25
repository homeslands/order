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
    // eslint-disable-next-line no-console
    console.log('🔐 LOGIN useEffect triggered');
    // eslint-disable-next-line no-console
    console.log('userInfo in login', userInfo)
    // eslint-disable-next-line no-console
    console.log('isAuthenticated:', isAuthenticated());
    // eslint-disable-next-line no-console
    console.log('token exists:', !!token);
    // eslint-disable-next-line no-console
    console.log('currentUrl:', currentUrl);

    if (isAuthenticated() && !_.isEmpty(userInfo) && token) {
      // eslint-disable-next-line no-console
      console.log('✅ User is authenticated, processing redirect...');

      let urlNavigate = ROUTE.HOME;
      const decoded: IToken = jwtDecode(token);
      // eslint-disable-next-line no-console
      console.log('decoded token in login:', decoded);

      if (!decoded.scope) {
        // eslint-disable-next-line no-console
        console.log('❌ No scope in token, exiting');
        return;
      }

      const scope = typeof decoded.scope === "string" ? JSON.parse(decoded.scope) : decoded.scope;
      const permissions = scope.permissions || [];
      // eslint-disable-next-line no-console
      console.log('user permissions in login:', permissions);

      if (currentUrl) {
        // eslint-disable-next-line no-console
        console.log('📍 Has currentUrl, checking permission for:', currentUrl);

        // Kiểm tra quyền truy cập currentUrl
        if (userInfo.role.name === Role.CUSTOMER) {
          // eslint-disable-next-line no-console
          console.log('👤 User is CUSTOMER');
          // Customer không được phép truy cập route /system
          urlNavigate = !currentUrl.includes('/system') ? currentUrl : ROUTE.HOME;
          // eslint-disable-next-line no-console
          console.log('🎯 Customer urlNavigate:', urlNavigate);
        } else {
          // eslint-disable-next-line no-console
          console.log('👨‍💼 User is STAFF/TEST, checking route permission');
          const route = sidebarRoutes.find(route => currentUrl.includes(route.path));
          // eslint-disable-next-line no-console
          console.log('found route for currentUrl:', route);

          if (route && permissions.includes(route.permission)) {
            urlNavigate = currentUrl;
            // eslint-disable-next-line no-console
            console.log('✅ Has permission for currentUrl, using:', urlNavigate);
          } else {
            // eslint-disable-next-line no-console
            console.log('❌ No permission for currentUrl, finding first allowed route');
            // Tìm route đầu tiên mà user có quyền truy cập trong sidebarRoutes
            const firstAllowedRoute = sidebarRoutes.find(route => permissions.includes(route.permission));
            if (firstAllowedRoute) {
              urlNavigate = firstAllowedRoute.path;
              // eslint-disable-next-line no-console
              console.log('🎯 First allowed route:', urlNavigate);
            } else {
              // eslint-disable-next-line no-console
              console.log('❌ No allowed routes found, redirecting to 403');
              urlNavigate = ROUTE.FORBIDDEN;
            }
          }
        }
      } else {
        // eslint-disable-next-line no-console
        console.log('📍 No currentUrl, finding default route');
        // Nếu không có currentUrl, tìm route đầu tiên mà user có quyền truy cập
        if (userInfo?.role && userInfo?.role?.name === Role.CUSTOMER) {
          urlNavigate = ROUTE.HOME;
          // eslint-disable-next-line no-console
          console.log('👤 Customer default route:', urlNavigate);
        } else {
          const firstAllowedRoute = sidebarRoutes.find(route => permissions.includes(route.permission));
          if (firstAllowedRoute) {
            urlNavigate = firstAllowedRoute.path;
            // eslint-disable-next-line no-console
            console.log('👨‍💼 Staff default route:', urlNavigate);
          } else {
            // eslint-disable-next-line no-console
            console.log('❌ No allowed routes found for staff, redirecting to 403');
            urlNavigate = ROUTE.FORBIDDEN;
          }
        }
      }

      // eslint-disable-next-line no-console
      console.log('🧭 LOGIN navigating to:', urlNavigate);
      navigate(urlNavigate, { replace: true });
      setTimeout(() => {
        clearUrl();
      }, 1000);
    } else {
      // eslint-disable-next-line no-console
      console.log('❌ User not authenticated or missing data');
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
