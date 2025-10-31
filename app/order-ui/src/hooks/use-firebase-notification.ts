import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { getNativeFcmToken } from '@/utils/getNativeFcmToken'
import { getWebFcmToken } from '@/utils/getWebFcmToken'
import { notificationService } from '@/services/notification.service'
import type { UseFirebaseNotificationReturn } from '@/types/notification.types'

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
  const [fcmToken, setFcmToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[FCM] Hook init, userId:', userId)

    if (!userId) {
      // eslint-disable-next-line no-console
      console.log('[FCM] Skip: No userId')
      return
    }

    let mounted = true

    const setup = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // eslint-disable-next-line no-console
        console.log('[FCM] Platform:', Capacitor.getPlatform())

        // Lấy FCM token dựa vào platform
        const token = Capacitor.isNativePlatform()
          ? await getNativeFcmToken()
          : await getWebFcmToken()

        // eslint-disable-next-line no-console
        console.log('[FCM] Token received:', token ? 'YES' : 'NO')

        if (!mounted) return

        if (token) {
          setFcmToken(token)
          // eslint-disable-next-line no-console
          console.log('[FCM] Token set successfully')

          // Đăng ký token với backend
          await notificationService.registerToken(userId, token)
        } else {
          setError('Failed to get FCM token')
          // eslint-disable-next-line no-console
          console.log('[FCM] Failed to get token')
        }
      } catch (err) {
        if (!mounted) return

        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMsg)
        // eslint-disable-next-line no-console
        console.log('[FCM] Error:', errorMsg)
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
  }, [userId])

  // Cleanup khi logout
  useEffect(() => {
    return () => {
      if (fcmToken && userId) {
        notificationService.unregisterToken(userId, fcmToken)
      }
    }
  }, [fcmToken, userId])

  return { fcmToken, error, isLoading }
}
