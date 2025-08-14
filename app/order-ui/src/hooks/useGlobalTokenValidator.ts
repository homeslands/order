import { useEffect } from 'react'
import { useAuthStore, useUserStore } from '@/stores'

/**
 * Global Token Validator Hook
 *
 * Validates token expiration when app starts and automatically cleans up
 * expired tokens to prevent invalid authentication states.
 *
 * This hook runs only once when the app mounts to ensure:
 * - Expired tokens are cleaned from localStorage
 * - User data is cleared when tokens are invalid
 * - Login flow works correctly after token expiration
 */
export const useGlobalTokenValidator = () => {
  const { token, isAuthenticated, setLogout } = useAuthStore()
  const { removeUserInfo } = useUserStore()

  useEffect(() => {
    // Only validate on app mount - run once to clean up expired tokens
    if (token && !isAuthenticated()) {
      // Clean up expired auth data
      setLogout()
      removeUserInfo()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // No return value to avoid unnecessary re-renders
}
