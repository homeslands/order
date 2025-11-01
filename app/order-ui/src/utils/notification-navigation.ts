import { Capacitor } from '@capacitor/core'

/**
 * Parse notification URL and determine if it's internal or external
 * @param url - The URL to parse (relative or absolute)
 * @returns Parsed URL information
 */
export function parseNotificationUrl(url: string): {
  isInternal: boolean
  path: string
  fullUrl: string
} {
  try {
    const urlObj = new URL(url, window.location.origin)
    const isInternal = urlObj.origin === window.location.origin
    
    const result = {
      isInternal,
      path: urlObj.pathname + urlObj.search + urlObj.hash,
      fullUrl: url,
    }
    
    return result
  } catch {
    // Fallback for relative URLs
    const path = url.startsWith('/') ? url : `/${url}`
        
    return {
      isInternal: true,
      path: path,
      fullUrl: url,
    }
  }
}

/**
 * Navigate to the notification URL
 * Supports both Web and Native platforms
 * 
 * @param url - URL từ notification data (recommend: relative path như "/staff/orders/123")
 * @param navigate - React Router navigate function
 * 
 * @example
 * ```typescript
 * // Backend gửi:
 * data: { url: "/staff/orders/abc123" }
 * 
 * // Web: navigate("/staff/orders/abc123")
 * // Native: navigate("/staff/orders/abc123")
 * ```
 */
export async function navigateToNotificationUrl(
  url: string,
  navigate: (path: string) => void
): Promise<void> {
  const parsed = parseNotificationUrl(url)

  if (Capacitor.isNativePlatform()) {
    // === NATIVE APP (iOS/Android) ===
    await handleNativeNavigation(parsed, navigate)
  } else {
    // === WEB (Browser) ===
    handleWebNavigation(parsed, navigate)
  }
}

/**
 * Handle navigation for Web platform
 */
function handleWebNavigation(
  parsed: ReturnType<typeof parseNotificationUrl>,
  navigate: (path: string) => void
): void {
  if (parsed.isInternal) {
    // Internal: Use React Router
    navigate(parsed.path)
  } else {
    // External: Open in new tab
    window.open(parsed.fullUrl, '_blank')
  }
}

/**
 * Handle navigation for Native platforms
 */
async function handleNativeNavigation(
  parsed: ReturnType<typeof parseNotificationUrl>,
  navigate: (path: string) => void
): Promise<void> {
  if (parsed.isInternal) {
    // Internal: Use React Router (same as Web)
    navigate(parsed.path)
  } else {
    // External: Open in InAppBrowser
    try {
      const { Browser } = await import('@capacitor/browser')
      await Browser.open({ 
        url: parsed.fullUrl,
        presentationStyle: 'popover', // iOS: popover, fullscreen
        toolbarColor: '#1a1a1a', // Toolbar color
      })
    } catch (error) {
      // Fallback: Try window.open
      window.open(parsed.fullUrl, '_system')
    }
  }
}