import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useUserStore } from '@/stores'
import { useAppLifecycle, useFirebaseNotification, useNotificationListener } from '@/hooks'
import { fcmTokenManager } from '@/services/fcm-token-manager'
import { navigateToNotificationUrl } from '@/utils'
import notificationSound from '@/assets/sound/notification.mp3'

/**
 * Component quản lý notification system
 * Phải nằm BÊN TRONG RouterProvider để dùng useNavigate()
 */
export function NotificationProvider() {
  const { userInfo } = useUserStore()
  const navigate = useNavigate()

  // Start/stop scheduler based on user login status
  useEffect(() => {
    if (userInfo?.slug) {
      fcmTokenManager.startScheduler()
    }
    return () => fcmTokenManager.stopScheduler()
  }, [userInfo?.slug])

  // Check token when app resumes
  useAppLifecycle(async () => {
    await fcmTokenManager.checkAndRefreshToken()
  })

  // 1️⃣ Lấy FCM token và đăng ký với backend
  useFirebaseNotification(userInfo?.slug ?? '')

  // 2️⃣ Lắng nghe thông báo foreground
  const { latestNotification, clearNotification } = useNotificationListener()

  // Xử lý khi có notification mới (foreground)
  useEffect(() => {
    if (latestNotification) {
      const notifTitle = latestNotification.notification?.title || 'Thông báo mới'
      const notifBody = latestNotification.notification?.body || ''
      const hasUrl = !!latestNotification.data?.url

      // Custom toast với UI đơn giản và đẹp
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'animate-in slide-in-from-top-5' : 'animate-out slide-out-to-top-5'
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xl">🔔</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{notifTitle}</p>
                  {notifBody && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{notifBody}</p>
                  )}
                  
                  {/* Action button nếu có URL */}
                  {hasUrl && (
                    <button
                      onClick={async () => {
                        toast.dismiss(t.id)
                        await navigateToNotificationUrl(latestNotification.data?.url ?? '', navigate)
                      }}
                      className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Xem chi tiết →
                    </button>
                  )}
                </div>

                {/* Close button */}
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ),
        {
          duration: 6000,
          position: 'top-right',
        },
      )

      try {
        const audio = new Audio(notificationSound)
        audio.volume = 0.5
        audio.play().catch(() => {
          // Ignore autoplay errors
        })
      } catch {
        // Ignore audio errors
      }

      clearNotification()
    }
  }, [latestNotification, clearNotification, navigate])

  // Listen for messages từ Service Worker (background notification clicks)
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleServiceWorkerMessage = (event: MessageEvent) => {
        if (event.data?.type === 'NOTIFICATION_NAVIGATION') {
          navigateToNotificationUrl(event.data.url, navigate)
        }
      }

      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage)

      return () => {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage)
      }
    }
  }, [navigate])

  return null
}

