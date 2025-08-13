import { useUserStore, useAuthStore } from '@/stores'
import { AuthState } from '@/types'

/**
 * Kiểm tra xem có cần load userInfo không
 * Sử dụng bên ngoài auth store để tránh circular dependency
 */
export const checkNeedsUserInfo = (): boolean => {
  const userStore = useUserStore.getState()
  return !userStore.userInfo
}

/**
 * Lấy auth state với đầy đủ logic kiểm tra userInfo
 */
export const getDetailedAuthState = (): AuthState => {
  // Import auth store methods
  const authStore = useAuthStore.getState()

  if (authStore.isRefreshing) {
    return AuthState.REFRESHING
  }

  if (!authStore.isTokenValid()) {
    return AuthState.UNAUTHENTICATED
  }

  // Kiểm tra xem có cần userInfo không
  if (checkNeedsUserInfo()) {
    return AuthState.LOADING
  }

  return AuthState.AUTHENTICATED
}

/**
 * Check authentication với userInfo consideration
 */
export const isFullyAuthenticated = (): boolean => {
  return getDetailedAuthState() === AuthState.AUTHENTICATED
}

/**
 * Check nếu đang trong trạng thái loading (có token nhưng chưa có userInfo)
 */
export const isAuthLoading = (): boolean => {
  return getDetailedAuthState() === AuthState.LOADING
}
