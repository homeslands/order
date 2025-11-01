// Types cho Firebase Cloud Messaging

export interface FcmTokenData {
  token: string
  platform: 'web' | 'ios' | 'android'
  userId: string
}

export interface NotificationPayload {
  notification?: {
    title?: string
    body?: string
    icon?: string
    image?: string
  }
  data?: Record<string, string>
  from?: string
  collapseKey?: string
  messageId?: string
}

export interface NotificationData {
  type?: 'order' | 'chef_order' | 'system' | 'promotion'
  orderId?: string
  url?: string
  [key: string]: string | undefined
}

export interface UseFirebaseNotificationReturn {
  fcmToken: string | null
  error: string | null
  isLoading: boolean
}

export interface UseNotificationListenerReturn {
  latestNotification: NotificationPayload | null
  clearNotification: () => void
}

// Error types for notifications
export enum NotificationErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  TOKEN_FAILED = 'TOKEN_FAILED',
  NOT_SUPPORTED = 'NOT_SUPPORTED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVICE_WORKER_ERROR = 'SERVICE_WORKER_ERROR',
  UNKNOWN = 'UNKNOWN',
}

export interface NotificationError {
  type: NotificationErrorType
  message: string
  canRetry: boolean
  originalError?: Error | unknown
}
