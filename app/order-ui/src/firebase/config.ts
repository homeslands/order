// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getMessaging, Messaging } from 'firebase/messaging'
import { Capacitor } from '@capacitor/core'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBBaA5FPySsAQKL5DEAA0Jp7Flf8ZbMVCg",
  authDomain: "order-notification-dev.firebaseapp.com",
  projectId: "order-notification-dev",
  storageBucket: "order-notification-dev.firebasestorage.app",
  messagingSenderId: "972559792749",
  appId: "1:972559792749:web:1580e74b049fa8069c1d64",
  measurementId: "G-XJNL3ZZ17B"
};

export const app = initializeApp(firebaseConfig)

// ⚠️ CHỈ khởi tạo messaging trên WEB, KHÔNG trên Native (iOS/Android)
export let messaging: Messaging | null = null

if (!Capacitor.isNativePlatform()) {
  messaging = getMessaging(app)
}
