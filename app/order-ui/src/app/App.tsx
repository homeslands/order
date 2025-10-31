import { StrictMode, useState, useEffect } from 'react'
import { AxiosError, isAxiosError } from 'axios'
import { RouterProvider } from 'react-router-dom'
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { has } from 'lodash'
import toast from 'react-hot-toast'

import { router } from '@/router'
import '@/i18n'
import { IApiErrorResponse, IApiResponse } from '@/types'
import { showErrorToast } from '@/utils'
import { ThemeProvider } from '@/components/app/theme-provider'
import { useGlobalTokenValidator } from '@/hooks/useGlobalTokenValidator'
import { useAuthStore, useUserStore } from '@/stores'
import {
  useFirebaseNotification,
  useNotificationListener,
} from '@/hooks'

// Create a client
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (has(query.meta, 'ignoreGlobalError'))
        if (query.meta.ignoreGlobalError) return
      if (isAxiosError(error)) {
        const axiosError = error as AxiosError<IApiResponse<void>>
        if (axiosError.response?.data.code)
          showErrorToast(axiosError.response.data.code)
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _, __, mutation) => {
      if (has(mutation.meta, 'ignoreGlobalError'))
        if (mutation.meta.ignoreGlobalError) return
      if (isAxiosError(error)) {
        const axiosError = error as AxiosError<IApiErrorResponse>
        if (axiosError.response?.data.statusCode) {
          showErrorToast(axiosError.response?.data.statusCode)
        }
        return
      }
    },
  }),
})

function App() {
  const { userInfo } = useUserStore()

  // Debug: Check userInfo
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[App] userInfo:', userInfo)
    // eslint-disable-next-line no-console
    console.log('[App] userId:', userInfo?.slug ?? 'EMPTY')
  }, [userInfo])

  // 1️⃣ Lấy FCM token và đăng ký với backend
  const { fcmToken } = useFirebaseNotification(userInfo?.slug ?? '')

  // 2️⃣ Lắng nghe thông báo foreground
  const { latestNotification, clearNotification } = useNotificationListener()

  // Xử lý khi có notification mới (foreground)
  useEffect(() => {
    if (latestNotification) {
      const notifTitle =
        latestNotification.notification?.title || 'Thông báo mới'
      const notifBody = latestNotification.notification?.body || ''

      // eslint-disable-next-line no-console
      console.log('🔔 Notification received:', {
        title: notifTitle,
        body: notifBody,
        data: latestNotification.data,
      })

      // Hiển thị toast popup
      toast(
        (t) => (
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-semibold text-sm">{notifTitle}</p>
                {notifBody && (
                  <p className="text-sm text-gray-600 mt-1">{notifBody}</p>
                )}
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            {latestNotification.data?.url && (
              <button
                onClick={() => {
                  toast.dismiss(t.id)
                  // TODO: Navigate to URL
                  // navigate(latestNotification.data.url)
                  window.location.href = latestNotification.data?.url ?? ''
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium text-left"
              >
                Xem chi tiết →
              </button>
            )}
          </div>
        ),
        {
          duration: 5000,
          icon: '🔔',
          style: {
            borderRadius: '8px',
            background: '#fff',
            padding: '16px',
            boxShadow:
              '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          },
        },
      )

      // Phát âm thanh notification (optional)
      try {
        const audio = new Audio('/notification.mp3')
        audio.volume = 0.5
        audio.play().catch(() => {
          // Ignore autoplay errors
        })
      } catch {
        // Ignore audio errors
      }

      clearNotification()
    }
  }, [latestNotification, clearNotification])

  // Log token để test (comment out khi production)
  useEffect(() => {
    if (fcmToken) {
      // eslint-disable-next-line no-console
      console.log('FCM Token:', fcmToken)
    }
  }, [fcmToken])

  // ✅ State để track auth initialization
  const [isAuthInitialized, setIsAuthInitialized] = useState(false)

  // Global token validator - runs once on app startup to clean expired tokens
  useGlobalTokenValidator()



  // ✅ Đảm bảo auth cleanup hoàn thành trước khi render UI
  useEffect(() => {
    // Sync cleanup expired tokens để tránh race condition
    const authStore = useAuthStore.getState()
    const userStore = useUserStore.getState()

    if (authStore.token && !authStore.isAuthenticated()) {
      authStore.setLogout()
      userStore.removeUserInfo()
    }

    // Mark initialization as complete
    setIsAuthInitialized(true)
  }, [])

  // ✅ Show loading during auth initialization to prevent race conditions
  if (!isAuthInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col gap-4 items-center">
          <div className="w-8 h-8 rounded-full border-b-2 border-blue-600 animate-spin"></div>
          <p className="text-sm text-gray-600">Initializing...</p>
        </div>
      </div>
    )
  }

  return (
    <StrictMode>
      <ThemeProvider defaultTheme="light" storageKey="my-app-theme">
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>
  )
}

export default App
