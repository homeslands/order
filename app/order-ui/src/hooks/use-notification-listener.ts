import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { onMessage } from 'firebase/messaging'
import { FirebaseMessaging } from '@capacitor-firebase/messaging'
import { LocalNotifications } from '@capacitor/local-notifications'
import { messaging } from '@/firebase'
import type {
  NotificationPayload,
  UseNotificationListenerReturn,
} from '@/types/notification.types'
import { useNavigate } from 'react-router-dom'
import { navigateToNotificationUrl } from '@/utils'

/**
 * Hook để lắng nghe thông báo FOREGROUND (khi app đang mở)
 *
 * Background notifications được xử lý tự động:
 * - Web: firebase-messaging-sw.js
 * - Native: Capacitor Plugin
 *
 * @returns Latest notification và function để clear
 *
 * @example
 * ```tsx
 * const { latestNotification, clearNotification } = useNotificationListener()
 *
 * useEffect(() => {
 *   if (latestNotification) {
 *     toast.success(latestNotification.notification?.title)
 *     clearNotification()
 *   }
 * }, [latestNotification])
 * ```
 */
export function useNotificationListener(): UseNotificationListenerReturn {
  const navigate = useNavigate()
  const [latestNotification, setLatestNotification] =
    useState<NotificationPayload | null>(null)

  useEffect(() => {
    let cleanup: (() => void) | undefined

    if (Capacitor.isNativePlatform()) {
      // === NATIVE: Lắng nghe foreground notifications ===
      setupNativeListener().then((cleanupFn) => {
        cleanup = cleanupFn
      })
    } else {
      // === WEB: Lắng nghe foreground notifications ===
      setupWebListener().then((cleanupFn) => {
        cleanup = cleanupFn
      })
    }

    // Cleanup function được gọi khi component unmount
    return () => {
      if (cleanup) {
        cleanup()
      }
    }
  }, [navigate])

  const setupNativeListener = async () => {
    // Request permission cho local notifications
    await LocalNotifications.requestPermissions()

    // Store listener references để cleanup properly
    const notificationReceivedListener = await FirebaseMessaging.addListener(
      'notificationReceived',
      async (event) => {
        const notifData = {
          notification: {
            title: event.notification.title,
            body: event.notification.body,
          },
          data: event.notification.data as Record<string, string>,
        }

        setLatestNotification(notifData)

        // Hiển thị notification trên thanh thông báo (foreground)
        await LocalNotifications.schedule({
          notifications: [
            {
              title: event.notification.title || 'Thông báo mới',
              body: event.notification.body || '',
              id: Date.now(),
              extra: event.notification.data,
              smallIcon: 'ic_stat_icon_config_sample',
              iconColor: '#488AFF',
            },
          ],
        })
      },
    )

    // Lắng nghe khi user click vào notification
    const notificationActionListener = await FirebaseMessaging.addListener(
      'notificationActionPerformed',
      async (event) => {
        // Xử lý navigation dựa vào notification data
        const data = event.notification.data as Record<string, string> | undefined
        if (data?.url) {
          await navigateToNotificationUrl(data.url, navigate)
        }
      },
    )

    // Lắng nghe khi user click vào local notification
    const localNotificationListener = await LocalNotifications.addListener(
      'localNotificationActionPerformed',
      async (notification) => {
        const data = notification.notification.extra as
          | Record<string, string>
          | undefined
        if (data?.url) {
          await navigateToNotificationUrl(data.url, navigate)
        }
      },
    )

    // Return cleanup function với proper references
    return () => {
      notificationReceivedListener.remove()
      notificationActionListener.remove()
      localNotificationListener.remove()
    }
  }

  const setupWebListener = async () => {
    if (!messaging) {
      // Return empty cleanup function nếu messaging không available
      return () => {
        // No-op
      }
    }

    // Lắng nghe foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      setLatestNotification(payload as NotificationPayload)

      // Hiển thị notification trên browser (system notification)
      if (
        payload.notification?.title &&
        Notification.permission === 'granted'
      ) {
        const notif = new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: payload.notification.icon || '/icon.png',
          data: payload.data,
          tag: 'fcm-notification',
          requireInteraction: false,
        })

        // Xử lý click notification
        notif.onclick = async () => {
          window.focus()
          notif.close()
          if (payload.data?.url) {
            await navigateToNotificationUrl(payload.data.url, navigate)
          }
        }
      }
    })

    // Return cleanup function
    return unsubscribe
  }

  const clearNotification = () => {
    setLatestNotification(null)
  }

  return {
    latestNotification,
    clearNotification,
  }
}
