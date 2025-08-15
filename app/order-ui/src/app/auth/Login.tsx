import { useEffect, useState, useMemo } from 'react'
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
import { ROUTE } from '@/constants'
import { jwtDecode } from 'jwt-decode'
import { IToken } from '@/types'
import { calculateSmartNavigationUrl, safeNavigate } from '@/utils'
import { useTheme } from '@/components/app/theme-provider'

export default function Login() {
  const { t } = useTranslation(['auth'])
  const { theme, setTheme } = useTheme()

  // set theme as light mode by default
  useEffect(() => {
    if (theme !== 'light') {
      setTheme('light')
    }
  }, [theme, setTheme])
  const { token } = useAuthStore()
  const { userInfo } = useUserStore()
  const { currentUrl, clearUrl } = useCurrentUrlStore()
  const navigate = useNavigate()
  const [isNavigating, setIsNavigating] = useState(false)

  // Kiểm tra xem có đủ dữ liệu để navigation không
  // Enhanced: Thêm validation token expiration để tránh redirect với token hết hạn
  // Fix: Sử dụng single source of truth để tránh race condition
  const isReadyToNavigate = useMemo(() => {
    // ✅ Sử dụng cùng 1 nguồn data để đảm bảo consistency
    const authStore = useAuthStore.getState()
    const userStore = useUserStore.getState()

    // ✅ Kiểm tra đầy đủ với double validation
    return (
      authStore.token &&
      userStore.userInfo &&
      !isNavigating &&
      authStore.isAuthenticated() &&
      authStore.isTokenValid() // Thêm validation kép để chắc chắn
    )
  }, [isNavigating]) // Keep minimal dependencies để tránh stale closure

  // Helper function để lấy permissions từ token
  const getUserPermissions = useMemo(() => {
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

  // Helper function để tính toán URL navigation với smart logic
  const navigationUrl = useMemo(() => {
    if (!userInfo || !token) return ROUTE.HOME

    const permissions = getUserPermissions

    return calculateSmartNavigationUrl({
      userInfo,
      permissions,
      currentUrl
    })
  }, [userInfo, token, currentUrl, getUserPermissions])

  // ✅ Safety effect để handle expired tokens sau khi component mount
  useEffect(() => {
    // Check auth state consistency và cleanup nếu cần
    const authStore = useAuthStore.getState()
    const userStore = useUserStore.getState()

    if (authStore.token && !authStore.isAuthenticated()) {
      // Token tồn tại nhưng không valid → cleanup
      authStore.setLogout()
      userStore.removeUserInfo()
      setIsNavigating(false)
    }
  }, []) // Chỉ chạy 1 lần khi component mount

  // ✅ Effect để detect existing auth state (auto-login when page loads)  
  useEffect(() => {
    // Chỉ auto-redirect nếu đã có sẵn token + userInfo khi component mount
    // Không handle fresh login (LoginForm sẽ handle)
    const authStore = useAuthStore.getState()
    const userStore = useUserStore.getState()

    if (authStore.token && userStore.userInfo && !isNavigating && authStore.isAuthenticated()) {
      // Existing valid session detected → isReadyToNavigate effect sẽ handle navigation
    }
  }, [isNavigating]) // ✅ Only depend on isNavigating to prevent loops

  // ✅ Handle auto-redirect for existing sessions (không phải fresh login)
  useEffect(() => {
    if (isReadyToNavigate) {
      setIsNavigating(true)

      // Sử dụng safe navigation với loop detection
      const navigationSuccess = safeNavigate(
        navigate,
        navigationUrl,
        window.location.pathname
      )

      // Chỉ clear URL nếu navigation thành công
      if (navigationSuccess) {
        // Clear URL sau khi navigate thành công
        requestAnimationFrame(() => {
          clearUrl()
          setIsNavigating(false)
        })
      } else {
        // Nếu navigation failed (loop detected), reset state
        setIsNavigating(false)
        clearUrl()
      }
    }
  }, [isReadyToNavigate, navigationUrl, navigate, clearUrl])

  // Hiển thị loading khi đang navigate để tránh nháy
  if (isNavigating) {
    return (
      <div className="flex relative justify-center items-center min-h-screen">
        <img
          src={LoginBackground}
          className="object-cover absolute top-0 left-0 w-full h-full sm:object-fill"
        />
        <div className="flex relative z-10 justify-center items-center w-full h-full">
          <div className="flex flex-col gap-4 items-center">
            <div className="w-8 h-8 rounded-full border-b-2 border-white animate-spin"></div>
            <p className="text-sm text-white">Đang chuyển hướng...</p>
          </div>
        </div>
      </div>
    )
  }

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
          <CardFooter className="flex justify-between items-center text-xs text-white sm:text-sm">
            <div className="flex gap-1">
              <span>{t('login.noAccount')}</span>
              <NavLink to={ROUTE.REGISTER} className="text-primary">
                {t('login.register')}
              </NavLink>
            </div>
            <NavLink to={ROUTE.FORGOT_PASSWORD} className="text-primary">
              {t('login.forgotPassword')}
            </NavLink>
          </CardFooter>
          <div className="my-4 text-xs text-center text-white sm:text-sm">
            <NavLink to={ROUTE.CLIENT_HOME} className="text-muted/70 hover:underline">
              {t('login.goBackToHome')}
            </NavLink>
          </div>
        </Card>
      </div>
    </div>
  )
}
