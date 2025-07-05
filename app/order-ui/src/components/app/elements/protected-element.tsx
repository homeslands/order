import { useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { jwtDecode } from 'jwt-decode'

import { ROUTE } from '@/constants'
import { sidebarRoutes } from '@/router/routes'
import { useAuthStore, useCartItemStore, useCurrentUrlStore, useUserStore } from '@/stores'
import { Role } from '@/constants/role'
import { showToast } from '@/utils'
import { IToken } from '@/types'

interface ProtectedElementProps {
  element: ReactNode,
}

export default function ProtectedElement({
  element,
}: ProtectedElementProps) {
  // eslint-disable-next-line no-console
  console.log('🚀 ProtectedElement component rendered');

  const { isAuthenticated, setLogout, token, isRefreshing } = useAuthStore()
  const { t } = useTranslation('auth')
  const { setCurrentUrl } = useCurrentUrlStore()
  const { clearCart } = useCartItemStore()
  const { removeUserInfo, userInfo } = useUserStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Wrap navigate để log
  const loggedNavigate = useCallback((to: string | number) => {
    if (typeof to === 'string') {
      navigate(to);
    } else {
      navigate(to);
    }
  }, [navigate]);

  const handleLogout = useCallback(() => {
    setLogout()
    removeUserInfo()
    clearCart()
    loggedNavigate(ROUTE.LOGIN)
  }, [setLogout, removeUserInfo, loggedNavigate, clearCart])

  const hasPermissionForRoute = useCallback((pathname: string) => {

    if (!token || !userInfo?.role?.name) {
      return false;
    }

    // Customer không được phép truy cập route /system
    if (userInfo.role.name === Role.CUSTOMER) {
      if (pathname.includes('/system')) {
        return false;
      }
      return true;
    }

    if (pathname.includes(ROUTE.STAFF_PROFILE)
      || pathname.includes(ROUTE.STAFF_ORDER_PAYMENT)
      || pathname.includes(ROUTE.ORDER_SUCCESS)) {
      return true;
    }

    // Kiểm tra permission từ token
    const decoded: IToken = jwtDecode(token);

    if (!decoded.scope) {
      return false;
    }

    const scope = typeof decoded.scope === "string" ? JSON.parse(decoded.scope) : decoded.scope;
    const permissions = scope.permissions || [];

    // Tìm route tương ứng với pathname
    const route = sidebarRoutes.find(route => pathname.includes(route.path));

    const hasPermission = route ? permissions.includes(route.permission) : false;
    return hasPermission;
  }, [token, userInfo])

  useEffect(() => {
    // Nếu đang refresh token thì chờ, không làm gì cả
    if (isRefreshing) {
      return;
    }

    if (!isAuthenticated()) {
      setCurrentUrl(location.pathname)
      handleLogout()
      showToast(t('toast.sessionExpired'))
      return;
    }

    // Kiểm tra quyền truy cập route hiện tại
    const hasPermission = hasPermissionForRoute(location.pathname);

    if (!hasPermission) {
      loggedNavigate(ROUTE.FORBIDDEN);
    }
  }, [
    isAuthenticated,
    isRefreshing,
    location.pathname,
    hasPermissionForRoute,
    loggedNavigate,
    handleLogout,
    setCurrentUrl,
    t
  ])

  // Hiển thị loading khi đang refresh token
  if (isRefreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary"></div>
      </div>
    )
  }

  return <>{element}</>
}
