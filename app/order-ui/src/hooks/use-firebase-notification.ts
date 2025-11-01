import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { getNativeFcmToken } from '@/utils/getNativeFcmToken'
import { getWebFcmToken } from '@/utils/getWebFcmToken'
import type { UseFirebaseNotificationReturn, NotificationError } from '@/types/notification.types'
import { NotificationErrorType } from '@/types/notification.types'
import { useUserStore } from '@/stores'

/**
 * Hook để lấy FCM token và đăng ký với backend
 *
 * @param userId - ID của user hiện tại
 * @returns FCM token, error state, loading state
 *
 * @example
 * ```tsx
 * const { fcmToken, error, isLoading } = useFirebaseNotification(user?.id)
 * ```
 */
export function useFirebaseNotification(
  userId?: string,
): UseFirebaseNotificationReturn {
  const { getDeviceToken, setDeviceToken } = useUserStore()
  const [fcmToken, setFcmToken] = useState<string | null>(getDeviceToken() || null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!userId) {
      return
    }

    let mounted = true

    const setup = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Lấy FCM token dựa vào platform
        const token = Capacitor.isNativePlatform()
          ? await getNativeFcmToken()
          : await getWebFcmToken()

        if (token) {
          setDeviceToken(token)
        }

        if (!mounted) return

        if (token) {
          setFcmToken(token)
        } else {
          setError('Failed to get FCM token')
        }
      } catch (err: unknown) {
        if (!mounted) return

        const notifError = createNotificationError(err)
        setError(notifError.message)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    setup()

    // Cleanup khi component unmount
    return () => {
      mounted = false
    }
  }, [userId, setDeviceToken])

  return { fcmToken, error, isLoading }
}

/**
 * Create structured error from unknown error
 */
function createNotificationError(err: unknown): NotificationError {
  if (err instanceof Error) {
    const message = err.message.toLowerCase()
    
    // Permission denied
    if (message.includes('permission') || message.includes('denied')) {
      return {
        type: NotificationErrorType.PERMISSION_DENIED,
        message: 'toast.notificationPermissionDenied',
        canRetry: false,
        originalError: err,
      }
    }
    
    // Network error
    if (message.includes('network') || message.includes('offline') || message.includes('fetch')) {
      return {
        type: NotificationErrorType.NETWORK_ERROR,
        message: 'toast.notificationNetworkError',
        canRetry: true,
        originalError: err,
      }
    }
    
    // Service worker error
    if (message.includes('service worker') || message.includes('registration')) {
      return {
        type: NotificationErrorType.SERVICE_WORKER_ERROR,
        message: 'toast.notificationServiceWorkerError',
        canRetry: true,
        originalError: err,
      }
    }
    
    // Not supported
    if (message.includes('not supported') || message.includes('unsupported')) {
      return {
        type: NotificationErrorType.NOT_SUPPORTED,
        message: 'toast.notificationNotSupported',
        canRetry: false,
        originalError: err,
      }
    }
  }
  
  // Default error
  return {
    type: NotificationErrorType.TOKEN_FAILED,
    message: 'toast.notificationTokenFailed',
    canRetry: true,
    originalError: err,
  }
}
