import { Capacitor } from '@capacitor/core'
import type { FcmTokenData } from '@/types/notification.types'

/**
 * Service để quản lý notification business logic
 */
class NotificationService {
  private apiUrl = import.meta.env.VITE_API_URL || '/api'

  /**
   * Đăng ký FCM token lên backend
   */
  async registerToken(userId: string, fcmToken: string): Promise<boolean> {
    try {
      const platform = Capacitor.getPlatform() as 'web' | 'ios' | 'android'

      const payload: FcmTokenData = {
        token: fcmToken,
        platform,
        userId,
      }

      // TODO: Uncomment khi có API endpoint
      const response = await fetch(
        `${this.apiUrl}/notifications/register-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to register token: ${response.statusText}`)
      }

      return true
    } catch {
      return false
    }
  }

  /**
   * Xóa FCM token khỏi backend (khi logout)
   */
  async unregisterToken(userId: string, fcmToken: string): Promise<boolean> {
    try {
      // TODO: Uncomment khi có API endpoint
      const response = await fetch(
        `${this.apiUrl}/notifications/unregister-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: fcmToken, userId }),
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to unregister token: ${response.statusText}`)
      }

      return true
    } catch {
      return false
    }
  }
}

export const notificationService = new NotificationService()
