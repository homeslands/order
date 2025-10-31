import { FirebaseMessaging } from '@capacitor-firebase/messaging'

export async function getNativeFcmToken() {
  try {
    // eslint-disable-next-line no-console
    console.log('[FCM Native] Requesting permissions...')

    const permission = await FirebaseMessaging.requestPermissions()

    // eslint-disable-next-line no-console
    console.log('[FCM Native] Permission result:', permission.receive)

    if (permission.receive === 'granted') {
      // eslint-disable-next-line no-console
      console.log('[FCM Native] Getting token...')

      const result = await FirebaseMessaging.getToken()

      // eslint-disable-next-line no-console
      console.log('[FCM Native] Token:', result.token)

      return result.token
    } else {
      // eslint-disable-next-line no-console
      console.log('[FCM Native] Permission denied')
      return null
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('[FCM Native] Error:', err)
    return null
  }
}
