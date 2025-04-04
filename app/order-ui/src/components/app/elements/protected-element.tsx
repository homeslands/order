import { useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { jwtDecode } from 'jwt-decode'

import { ROUTE } from '@/constants'
import { sidebarRoutes } from '@/router/routes'
import { useAuthStore, useCurrentUrlStore, useUserStore } from '@/stores'
import { Role } from '@/constants/role'
import { showToast } from '@/utils'
import { IToken } from '@/types'

interface ProtectedElementProps {
  element: ReactNode,
}

export default function ProtectedElement({
  element,
}: ProtectedElementProps) {
  const { isAuthenticated, setLogout, token } = useAuthStore()
  const { t } = useTranslation('auth')
  const { setCurrentUrl } = useCurrentUrlStore()
  const { removeUserInfo, userInfo } = useUserStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = useCallback(() => {
    setLogout()
    removeUserInfo()
    navigate(ROUTE.LOGIN)
  }, [setLogout, removeUserInfo, navigate])

  const hasPermissionForRoute = useCallback((pathname: string) => {
    if (!token || !userInfo?.role?.name) return false;

    // Customer không được phép truy cập route /system
    if (userInfo.role.name === Role.CUSTOMER) {
      if (pathname.includes('/system')) {
        return false;
      }
      return true;
    }

    if (pathname.includes(ROUTE.STAFF_PROFILE)
      || pathname.includes(ROUTE.STAFF_MENU_MANAGEMENT)
      || pathname.includes(ROUTE.STAFF_ORDER_PAYMENT)
      || pathname.includes(ROUTE.ORDER_SUCCESS)) {
      return true;
    }
    // Kiểm tra permission từ token
    const decoded: IToken = jwtDecode(token);
    if (!decoded.scope) return false;

    const scope = typeof decoded.scope === "string" ? JSON.parse(decoded.scope) : decoded.scope;
    const permissions = scope.permissions || [];

    // Tìm route tương ứng với pathname
    const route = sidebarRoutes.find(route => pathname.includes(route.path));

    return route ? permissions.includes(route.permission) : false;
  }, [token, userInfo])

  const findFirstAllowedRoute = useCallback(() => {
    if (!token || !userInfo?.role?.name) return ROUTE.LOGIN;

    if (userInfo.role.name === Role.CUSTOMER) {
      return ROUTE.HOME;
    }

    const decoded: IToken = jwtDecode(token);
    if (!decoded.scope) return ROUTE.LOGIN;

    const scope = typeof decoded.scope === "string" ? JSON.parse(decoded.scope) : decoded.scope;
    const permissions = scope.permissions || [];

    // Tìm route đầu tiên mà user có quyền truy cập
    const firstAllowedRoute = sidebarRoutes.find(route => permissions.includes(route.permission));
    return firstAllowedRoute ? firstAllowedRoute.path : ROUTE.LOGIN;
  }, [token, userInfo])

  useEffect(() => {
    if (!isAuthenticated()) {
      setCurrentUrl(location.pathname)
      handleLogout()
      showToast(t('toast.sessionExpired'))
      return;
    }

    // Kiểm tra quyền truy cập route hiện tại
    if (!hasPermissionForRoute(location.pathname)) {
      const allowedRoute = findFirstAllowedRoute();
      navigate(allowedRoute);
    }
  }, [
    isAuthenticated,
    location.pathname,
    hasPermissionForRoute,
    findFirstAllowedRoute,
    navigate,
    handleLogout,
    setCurrentUrl,
    t
  ])

  return <>{element}</>
}
