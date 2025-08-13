import { ROUTE } from '@/constants'
import { Role } from '@/constants/role'
import { sidebarRoutes } from '@/router/routes'
import { IUserInfo } from '@/types'

/**
 * CurrentUrl Manager - Centralized logic để handle currentUrl navigation
 */

interface NavigationContext {
  userInfo: IUserInfo | null
  permissions: string[]
  currentUrl: string | null
}

/**
 * Validate xem một URL có hợp lệ để redirect không
 */
export const isValidRedirectUrl = (url: string | null): boolean => {
  if (!url) return false

  // Không redirect về login, register, hoặc auth pages
  const authPages = [
    ROUTE.LOGIN,
    ROUTE.REGISTER,
    ROUTE.FORGOT_PASSWORD,
    ROUTE.RESET_PASSWORD,
  ]

  return !authPages.some((page) => url.includes(page))
}

/**
 * Kiểm tra xem user có quyền truy cập URL này không
 */
export const canAccessUrl = (
  url: string,
  context: NavigationContext,
): boolean => {
  const { userInfo, permissions } = context

  if (!userInfo?.role?.name) return false

  // Customer không được phép truy cập route /system
  if (userInfo.role.name === Role.CUSTOMER) {
    return !url.includes('/system')
  }

  // Staff - check permissions
  const route = sidebarRoutes.find((route) => url.includes(route.path))

  if (!route) {
    // Nếu không tìm thấy route config, có thể là route public
    return true
  }

  return permissions.includes(route.permission || '')
}

/**
 * Tìm first allowed route cho user
 */
export const findFirstAllowedRoute = (context: NavigationContext): string => {
  const { userInfo, permissions } = context

  if (!userInfo?.role?.name) {
    return ROUTE.FORBIDDEN
  }

  // Customer luôn về HOME
  if (userInfo.role.name === Role.CUSTOMER) {
    return ROUTE.HOME
  }

  // Staff - tìm route đầu tiên có quyền
  const firstAllowedRoute = sidebarRoutes.find((route) =>
    permissions.includes(route.permission || ''),
  )

  return firstAllowedRoute ? firstAllowedRoute.path : ROUTE.FORBIDDEN
}

/**
 * Calculate navigation URL với logic thông minh
 */
export const calculateSmartNavigationUrl = (
  context: NavigationContext,
): string => {
  const { currentUrl } = context

  // Nếu không có currentUrl, tìm route mặc định
  if (!currentUrl || !isValidRedirectUrl(currentUrl)) {
    return findFirstAllowedRoute(context)
  }

  // Nếu có currentUrl và user có quyền truy cập
  if (canAccessUrl(currentUrl, context)) {
    return currentUrl
  }

  // Nếu không có quyền truy cập currentUrl, tìm route khác
  return findFirstAllowedRoute(context)
}

/**
 * Kiểm tra xem có phải navigation loop không
 */
export const detectNavigationLoop = (
  fromUrl: string,
  toUrl: string,
  attempts: number = 0,
): boolean => {
  // Nếu navigate về cùng một URL nhiều lần
  if (fromUrl === toUrl && attempts > 2) {
    return true
  }

  // Nếu navigate giữa forbidden và login quá nhiều lần
  if (
    (fromUrl.includes(ROUTE.FORBIDDEN) && toUrl.includes(ROUTE.LOGIN)) ||
    (fromUrl.includes(ROUTE.LOGIN) && toUrl.includes(ROUTE.FORBIDDEN))
  ) {
    return attempts > 1
  }

  return false
}

/**
 * Safe navigation với loop detection
 */
export const safeNavigate = (
  navigate: (to: string, options?: { replace?: boolean }) => void,
  toUrl: string,
  fromUrl?: string,
  attempts: number = 0,
): boolean => {
  // Detect loop
  if (fromUrl && detectNavigationLoop(fromUrl, toUrl, attempts)) {
    // Navigation loop detected, fallback to HOME
    navigate(ROUTE.HOME, { replace: true })
    return false
  }

  // Normal navigation
  navigate(toUrl, { replace: true })
  return true
}
