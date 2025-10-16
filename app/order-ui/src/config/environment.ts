import { Capacitor } from '@capacitor/core'

/**
 * Environment Configuration
 * Quản lý API URLs và configs cho web/mobile
 */

// Kiểm tra xem có phải native app không
export const isNativeApp = () => Capacitor.isNativePlatform()

// Lấy platform hiện tại
export const getPlatform = () => Capacitor.getPlatform() // 'web' | 'android' | 'ios'

// API Base URLs
const API_URLS = {
  development: {
    web:
      import.meta.env.VITE_BASE_API_URL || 'http://localhost:3000/api/v1.0.0',
    mobile:
      import.meta.env.VITE_BASE_API_URL ||
      'https://sandbox.order.cmsiot.net/api/v1.0.0',
  },
  production: {
    web:
      import.meta.env.VITE_BASE_API_URL ||
      'https://order.cmsiot.net/api/v1.0.0',
    mobile:
      import.meta.env.VITE_BASE_API_URL ||
      'https://order.cmsiot.net/api/v1.0.0',
  },
}

// Lấy API base URL dựa trên môi trường
export const getApiBaseUrl = (): string => {
  const isDev = import.meta.env.DEV
  const env = isDev ? 'development' : 'production'

  if (isNativeApp()) {
    return API_URLS[env].mobile
  }

  return API_URLS[env].web
}

// Lấy Public File URL
export const getPublicFileUrl = (): string => {
  return import.meta.env.VITE_PUBLIC_FILE_URL || `${getApiBaseUrl()}/file`
}

// Config cho từng platform
export const platformConfig = {
  timeout: isNativeApp() ? 30000 : 10000, // Mobile cần timeout cao hơn
  retries: isNativeApp() ? 3 : 1,
  withCredentials: !isNativeApp(), // Tắt credentials cho mobile
}

// Feature flags
export const features = {
  enableGoogleMaps: true,
  enablePushNotifications: isNativeApp(),
  enableGeolocation: true,
  enableCamera: isNativeApp(),
  enableBiometric: isNativeApp() && getPlatform() === 'android',
}

// App info
export const appInfo = {
  name: 'TREND Coffee',
  version: '1.4.5',
  buildNumber: '1',
}

// Debug helper
export const debugInfo = () => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log('=== Environment Debug Info ===')
    // eslint-disable-next-line no-console
    console.log('Platform:', getPlatform())
    // eslint-disable-next-line no-console
    console.log('Is Native:', isNativeApp())
    // eslint-disable-next-line no-console
    console.log('API Base URL:', getApiBaseUrl())
    // eslint-disable-next-line no-console
    console.log('Public File URL:', getPublicFileUrl())
    // eslint-disable-next-line no-console
    console.log('Environment:', import.meta.env.MODE)
    // eslint-disable-next-line no-console
    console.log('Features:', features)
    // eslint-disable-next-line no-console
    console.log('============================')
  }
}
