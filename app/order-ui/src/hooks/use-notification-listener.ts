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
  const [latestNotification, setLatestNotification] =
    useState<NotificationPayload | null>(null)

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // === NATIVE: Lắng nghe foreground notifications ===
      setupNativeListener()
    } else {
      // === WEB: Lắng nghe foreground notifications ===
      setupWebListener()
    }
  }, [])

  const setupNativeListener = async () => {
    // Request permission cho local notifications
    await LocalNotifications.requestPermissions()

    // Lắng nghe khi nhận notification (foreground)
    FirebaseMessaging.addListener('notificationReceived', async (event) => {
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
    })

    // Lắng nghe khi user click vào notification
    FirebaseMessaging.addListener('notificationActionPerformed', (event) => {
      // Xử lý navigation dựa vào notification data
      const data = event.notification.data as Record<string, string> | undefined
      if (data?.url) {
        // TODO: Navigate to URL
      }
    })

    // Lắng nghe khi user click vào local notification
    LocalNotifications.addListener(
      'localNotificationActionPerformed',
      (notification) => {
        const data = notification.notification.extra as
          | Record<string, string>
          | undefined
        if (data?.url) {
          // TODO: Navigate to URL
          window.location.href = data.url
        }
      },
    )

    // Cleanup
    return () => {
      FirebaseMessaging.removeAllListeners()
      LocalNotifications.removeAllListeners()
    }
  }

  const setupWebListener = async () => {
    if (!messaging) {
      return
    }

    // Request permission cho browser notifications
    if (Notification.permission === 'default') {
      await Notification.requestPermission()
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
        notif.onclick = () => {
          window.focus()
          notif.close()
          if (payload.data?.url) {
            window.location.href = payload.data.url
          }
        }
      }
    })

    // Cleanup
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
