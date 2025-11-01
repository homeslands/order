import { getToken } from 'firebase/messaging'
import { messaging } from '@/firebase'

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY

/**
 * Lấy FCM token cho Web Platform
 * @returns FCM token hoặc null nếu thất bại
 */
export async function getWebFcmToken(): Promise<string | null> {

  
  if (!messaging) {
    return null
  }

  try {
    const permission = await Notification.requestPermission()

    if (permission !== 'granted') {
      return null
    }

    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js',
    )
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    })
    
    if (token) {
      return token
    }
    
    return token
  } catch (error) {
    return null
  }
}
