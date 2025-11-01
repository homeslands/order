// src/services/fcm-token-manager.ts

import { registerDeviceToken, unregisterDeviceToken } from "@/api/notification"
import { Capacitor } from "@capacitor/core"
import { getNativeFcmToken } from "@/utils/getNativeFcmToken"
import { getWebFcmToken } from "@/utils/getWebFcmToken"
import { useUserStore } from "@/stores"
import { TOKEN_CHECK_INTERVAL, TOKEN_REFRESH_THRESHOLD } from "@/constants"

class FCMTokenManager {
  private intervalId: NodeJS.Timeout | null = null
  private visibilityHandler: (() => void) | null = null

  constructor() {
    // Khởi tạo visibility listener khi tạo instance
    this.setupVisibilityListener()
  }

  startScheduler() {
    // Prevent multiple schedulers running simultaneously
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
    
    this.intervalId = setInterval(async () => {
      await this.checkAndRefreshToken()
    }, TOKEN_CHECK_INTERVAL.INTERVAL)
  }
  
  async checkAndRefreshToken() {
    const savedToken = localStorage.getItem('fcm_token')
    const registeredAt = localStorage.getItem('fcm_token_registered_at')
    
    if (!savedToken || !registeredAt) return
    
    const elapsed = Date.now() - parseInt(registeredAt)
    
    // Nếu token đã đăng ký > 2 ngày, refresh
    if (elapsed > TOKEN_REFRESH_THRESHOLD.THRESHOLD) {
      try {
        const newToken = Capacitor.isNativePlatform() 
          ? await getNativeFcmToken() 
          : await getWebFcmToken()
        
        if (newToken && newToken !== savedToken) {
          // Token đã thay đổi -> Xóa cũ, đăng ký mới
          await unregisterDeviceToken(savedToken)
          await registerDeviceToken({
            token: newToken || '',
            platform: Capacitor.getPlatform(),
            userAgent: navigator.userAgent,
          })
          
          // Cập nhật token vào userStore
          useUserStore.getState().setDeviceToken(newToken || '')
          
          localStorage.setItem('fcm_token', newToken)
          localStorage.setItem('fcm_token_registered_at', Date.now().toString())
        } else if (newToken === savedToken) {
          localStorage.setItem('fcm_token_registered_at', Date.now().toString())
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[TokenManager] Token refresh failed:', error)
      }
    }
  }

  private setupVisibilityListener() {
    if (typeof document !== 'undefined') {
      // Cleanup old listener nếu có
      if (this.visibilityHandler) {
        document.removeEventListener('visibilitychange', this.visibilityHandler)
      }
      
      // Tạo handler mới và lưu reference để cleanup sau
      this.visibilityHandler = () => {
        if (document.visibilityState === 'visible') {
          this.checkAndRefreshToken()
        }
      }
      
      document.addEventListener('visibilitychange', this.visibilityHandler)
    }
  }
  
  stopScheduler() {
    // Clear interval
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    
    // Remove visibility listener
    if (this.visibilityHandler && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.visibilityHandler)
      this.visibilityHandler = null
    }
  }
  
  /**
   * Cleanup all resources (call when app unmounts or manager is no longer needed)
   */
  destroy() {
    this.stopScheduler()
  }
}

export const fcmTokenManager = new FCMTokenManager()