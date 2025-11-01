import { FirebaseMessaging } from '@capacitor-firebase/messaging'

export async function getNativeFcmToken() {
  try {
    const permission = await FirebaseMessaging.requestPermissions()

    if (permission.receive === 'granted') {
      const result = await FirebaseMessaging.getToken()

      return result.token
    } else {
      return null
    }
  } catch (err) {
    return null
  }
}
