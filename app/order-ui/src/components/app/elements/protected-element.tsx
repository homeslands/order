import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { ROUTE } from '@/constants'
import { useAuthStore, useUserStore } from '@/stores'
import { useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import { Role } from '@/constants/role'
import { showToast } from '@/utils'
import toast from 'react-hot-toast'

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
      toast.error(t('toast.forbidden'))

      switch (userInfo?.role.name) {
        case Role.STAFF:
        case Role.CHEF:
        case Role.MANAGER:
        case Role.ADMIN:
        case Role.SUPER_ADMIN:
          navigate(ROUTE.OVERVIEW, { replace: true })
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
    userInfo?.role.name,
  ])

  return hasRequiredPermissions() ? <>{element}</> : null
}
