import { useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { ROUTE } from '@/constants'
import { useAuthStore, useCurrentUrlStore, useUserStore } from '@/stores'
import { Role } from '@/constants/role'
import { showErrorToast, showToast } from '@/utils'

interface ProtectedElementProps {
  element: ReactNode
  allowedRoles: Role[] // Keep original array type for roles
}

export default function ProtectedElement({
  element,
  allowedRoles,
}: ProtectedElementProps) {
  const { isAuthenticated, setLogout } = useAuthStore()
  const { t } = useTranslation('auth')
  const { currentUrl, clearUrl } = useCurrentUrlStore()
  const { removeUserInfo, userInfo } = useUserStore()
  const navigate = useNavigate()

  const handleLogout = useCallback(() => {
    setLogout()
    removeUserInfo()
    navigate(ROUTE.LOGIN)
  }, [setLogout, removeUserInfo, navigate])

  const hasRequiredPermissions = useCallback(() => {
    if (!userInfo?.role?.name || !allowedRoles) return false

    return allowedRoles.includes(userInfo.role.name)
  }, [userInfo, allowedRoles])

  useEffect(() => {
    if (!isAuthenticated()) {
      handleLogout()
      showToast(t('toast.sessionExpired'))
    } else if (!hasRequiredPermissions()) {
      showErrorToast(403)

      switch (userInfo?.role?.name) {
        case Role.STAFF:
        case Role.MANAGER:
        case Role.ADMIN:
        case Role.SUPER_ADMIN:
          navigate(ROUTE.OVERVIEW, { replace: true })
          break
        case Role.CHEF:
          navigate(currentUrl || ROUTE.STAFF_ORDER_MANAGEMENT, { replace: true })
          clearUrl()
          break
        default:
          navigate(ROUTE.HOME, { replace: true })
          break
      }
    }
  }, [
    isAuthenticated,
    navigate,
    handleLogout,
    hasRequiredPermissions,
    t,
    userInfo?.role?.name,
    currentUrl,
    clearUrl,
  ])

  return hasRequiredPermissions() ? <>{element}</> : null
}
