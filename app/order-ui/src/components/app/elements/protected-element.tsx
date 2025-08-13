import { useCallback, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { jwtDecode } from 'jwt-decode'

import { ROUTE } from '@/constants'
import { sidebarRoutes } from '@/router/routes'
import { useAuthStore, useCartItemStore, useCurrentUrlStore, useUserStore } from '@/stores'
import { Role } from '@/constants/role'
import { showToast, isAuthLoading, safeNavigate, isValidRedirectUrl } from '@/utils'
import { IToken } from '@/types'

interface ProtectedElementProps {
  element: ReactNode,
}

type PermissionCheckResult = boolean | 'loading'

export default function ProtectedElement({
  element,
}: ProtectedElementProps) {
  const { isAuthenticated, setLogout, token, isRefreshing } = useAuthStore()
  const { t } = useTranslation('auth')
  const { setCurrentUrl, shouldUpdateUrl } = useCurrentUrlStore()
  const { clearCart } = useCartItemStore()
  const { removeUserInfo, userInfo } = useUserStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Kiểm tra trạng thái loading của auth data - sử dụng helper function
  const isAuthDataLoading = isAuthLoading()

  // Helper: Extract permissions từ token với caching
  const tokenPermissions = useMemo(() => {
    if (!token) return []

    try {
      const decoded: IToken = jwtDecode(token)
      if (!decoded.scope) return []

      const scope = typeof decoded.scope === "string" ? JSON.parse(decoded.scope) : decoded.scope
      return scope.permissions || []
    } catch {
      return []
    }
  }, [token])

  // Helper: Các route không cần kiểm tra permission đặc biệt
  const publicStaffRoutes = useMemo(() => [
    ROUTE.STAFF_PROFILE,
    ROUTE.STAFF_ORDER_PAYMENT,
    ROUTE.ORDER_SUCCESS
  ], [])

  // Helper: Kiểm tra route có phải public staff route không
  const isPublicStaffRoute = useCallback((pathname: string) => {
    return publicStaffRoutes.some(route => pathname.includes(route))
  }, [publicStaffRoutes])

  // Safe navigate với loop detection
  const safeNavigateToRoute = useCallback((to: string) => {
    return safeNavigate(navigate, to, location.pathname)
  }, [navigate, location.pathname]);

  const handleLogout = useCallback(() => {
    setLogout()
    removeUserInfo()
    clearCart()
    safeNavigateToRoute(ROUTE.LOGIN)
  }, [setLogout, removeUserInfo, safeNavigateToRoute, clearCart])

  const hasPermissionForRoute = useCallback((pathname: string): PermissionCheckResult => {
    // 1. Kiểm tra loading state trước
    if (isAuthDataLoading) {
      return 'loading';
    }

    // 2. Kiểm tra dữ liệu cơ bản
    if (!token || !userInfo?.role?.name) {
      return false;
    }

    // 2.1. Safety check: Nếu pathname empty hoặc invalid
    if (!pathname || pathname === '/') {
      return true; // Allow root access
    }

    // 3. Xử lý Customer routes
    if (userInfo.role.name === Role.CUSTOMER) {
      // Customer không được phép truy cập route /system
      return !pathname.includes('/system');
    }

    // 4. Xử lý Staff routes - Public routes (không cần permission)
    if (isPublicStaffRoute(pathname)) {
      return true;
    }

    // 5. Kiểm tra permission cho các route khác
    if (tokenPermissions.length === 0) {
      // Nếu không có permissions trong token, chỉ cho phép public routes
      return false;
    }

    // 6. Tìm route config tương ứng
    const route = sidebarRoutes.find(route => pathname.includes(route.path));

    if (!route) {
      // Nếu không tìm thấy route config, có thể là route mới hoặc không được quản lý
      // Default: allow access (có thể thay đổi thành false tùy policy)
      return true;
    }

    // 7. Kiểm tra permission cụ thể
    const hasRequiredPermission = tokenPermissions.includes(route.permission);

    return hasRequiredPermission;
  }, [
    isAuthDataLoading,
    token,
    userInfo,
    isPublicStaffRoute,
    tokenPermissions
  ])

  useEffect(() => {
    // Nếu đang refresh token thì chờ, không làm gì cả
    if (isRefreshing) {
      return;
    }

    // Nếu đang loading auth data, chờ không làm gì
    if (isAuthDataLoading) {
      return;
    }

    if (!isAuthenticated()) {
      // Chỉ set currentUrl nếu nó là valid redirect URL và cần update
      if (isValidRedirectUrl(location.pathname) && shouldUpdateUrl(location.pathname)) {
        setCurrentUrl(location.pathname)
      }
      handleLogout()
      showToast(t('toast.sessionExpired'))
      return;
    }

    // Kiểm tra quyền truy cập route hiện tại
    const hasPermission = hasPermissionForRoute(location.pathname);

    // Chỉ redirect khi chắc chắn không có quyền (không phải loading)
    if (hasPermission === false) {
      safeNavigateToRoute(ROUTE.FORBIDDEN);
    }
    // Nếu hasPermission === 'loading', không làm gì cả, đợi load xong
  }, [
    isAuthenticated,
    isRefreshing,
    isAuthDataLoading,
    location.pathname,
    hasPermissionForRoute,
    safeNavigateToRoute,
    handleLogout,
    setCurrentUrl,
    shouldUpdateUrl,
    t
  ])

  // Hiển thị loading khi đang refresh token
  if (isRefreshing) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 rounded-full border-b-2 animate-spin border-primary"></div>
      </div>
    )
  }

  // Hiển thị loading khi đang load userInfo sau khi có token
  if (isAuthDataLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col gap-4 items-center">
          <div className="w-8 h-8 rounded-full border-b-2 animate-spin border-primary"></div>
          <p className="text-sm text-muted-foreground">Đang tải thông tin người dùng...</p>
        </div>
      </div>
    )
  }

  return <>{element}</>
}
