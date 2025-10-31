// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getMessaging, Messaging } from 'firebase/messaging'
import { Capacitor } from '@capacitor/core'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyDpQB9k3vuLVEoEEBjBlubMslADQPdcwuM',
  authDomain: 'order-notification-4b9b0.firebaseapp.com',
  projectId: 'order-notification-4b9b0',
  storageBucket: 'order-notification-4b9b0.firebasestorage.app',
  messagingSenderId: '798286114785',
  appId: '1:798286114785:web:16d1ee4d69d141681beca0',
  measurementId: 'G-W8XQ1YY2H6',
}

export const app = initializeApp(firebaseConfig)

// ⚠️ CHỈ khởi tạo messaging trên WEB, KHÔNG trên Native (iOS/Android)
export let messaging: Messaging | null = null

if (!Capacitor.isNativePlatform()) {
  messaging = getMessaging(app)
}
