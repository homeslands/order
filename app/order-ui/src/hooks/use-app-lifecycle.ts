// src/hooks/use-app-lifecycle.ts

import { Capacitor } from '@capacitor/core'
import { useEffect } from 'react'

export function useAppLifecycle(onResume: () => void) {
  useEffect(() => {
    // Web platform: sử dụng Visibility API
    if (!Capacitor.isNativePlatform()) {
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          onResume()
        }
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }

    // Native platform: sử dụng @capacitor/app (cần cài đặt)
    // Nếu muốn support native app, chạy: npm install @capacitor/app
    const setupNativeListener = async () => {
      try {
        const { App } = await import('@capacitor/app')
        const listener = await App.addListener('appStateChange', async (state) => {
          if (state.isActive) {
            onResume()
          }
        })
        
        return () => {
          listener.remove()
        }
      } catch {
        return () => {}
      }
    }

    let cleanup: (() => void) | undefined
    setupNativeListener().then(cleanupFn => {
      cleanup = cleanupFn
    })

    return () => {
      cleanup?.()
    }
  }, [onResume])
}