import { useCallback, useEffect, useState } from 'react'
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
  const { isAuthenticated, setLogout, token } = useAuthStore()
  const { t } = useTranslation('auth')
  const { setCurrentUrl } = useCurrentUrlStore()
  const { clearCart } = useCartItemStore()
  const { removeUserInfo, userInfo } = useUserStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [isInitializing, setIsInitializing] = useState(true)

  const handleLogout = useCallback(() => {
    setLogout()
    removeUserInfo()
    clearCart()
    navigate(ROUTE.LOGIN)
  }, [setLogout, removeUserInfo, navigate, clearCart])

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
    // Nếu có token nhưng chưa có userInfo, đợi một chút để userInfo load
    if (token && !userInfo && isAuthenticated()) {
      const timer = setTimeout(() => {
        setIsInitializing(false)
      }, 500) // 500ms cho optimistic approach

      return () => clearTimeout(timer)
    } else {
      setIsInitializing(false)
    }
  }, [token, userInfo, isAuthenticated])

  // Effect riêng để handle khi userInfo load xong
  useEffect(() => {
    // Khi userInfo vừa load xong và đang ở home page, redirect đến trang phù hợp
    if (userInfo && token && location.pathname === ROUTE.HOME && !isInitializing) {
      const allowedRoute = findFirstAllowedRoute();
      if (allowedRoute !== ROUTE.HOME) {
        navigate(allowedRoute);
      }
    }
  }, [userInfo, token, location.pathname, isInitializing, findFirstAllowedRoute, navigate])

  useEffect(() => {
    // Không thực hiện check nếu đang trong quá trình khởi tạo
    if (isInitializing) return

    if (!isAuthenticated()) {
      setCurrentUrl(location.pathname)
      handleLogout()
      showToast(t('toast.sessionExpired'))
      return;
    }

    // Nếu có token nhưng không có userInfo sau khi hết thời gian chờ
    // cho phép navigate nhưng với fallback route an toàn
    if (!userInfo) {
      // Redirect về home hoặc profile page thay vì logout
      navigate(ROUTE.HOME)
      return;
    }

    // Kiểm tra quyền truy cập route hiện tại
    if (!hasPermissionForRoute(location.pathname)) {
      const allowedRoute = findFirstAllowedRoute();
      navigate(allowedRoute);
    }
  }, [
    isInitializing,
    isAuthenticated,
    userInfo,
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
