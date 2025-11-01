// src/services/token-registration-queue.ts

import { registerDeviceToken } from '@/api/notification'
import { RETRY_DELAYS, MAX_RETRIES } from '@/constants'

interface QueueItem {
  token: string
  platform: string
  userAgent: string
  attempts: number
  lastAttempt: number
  userId?: string
}

class TokenRegistrationQueue {
  private queue: QueueItem[] = []
  private isProcessing = false
  private onlineHandler: (() => void) | null = null

  constructor() {
    this.setupOnlineListener()
  }

  /**
   * Add token to registration queue
   */
  async enqueue(item: Omit<QueueItem, 'attempts' | 'lastAttempt'>) {
    const queueItem: QueueItem = {
      ...item,
      attempts: 0,
      lastAttempt: 0,
    }

    // Check if token already in queue
    const existingIndex = this.queue.findIndex((q) => q.token === item.token)
    if (existingIndex >= 0) {
      this.queue[existingIndex] = queueItem
    } else {
      this.queue.push(queueItem)
    }

    await this.process()
  }

  /**
   * Process queue with retry logic
   */
  private async process() {
    if (this.isProcessing || this.queue.length === 0) return

    this.isProcessing = true

    while (this.queue.length > 0) {
      const item = this.queue[0]

      try {
        // Call API để register token
        await registerDeviceToken({
          token: item.token,
          platform: item.platform,
          userAgent: item.userAgent,
        })

        // Success - remove from queue
        this.queue.shift()

        // Save to localStorage
        localStorage.setItem('fcm_token', item.token)
        localStorage.setItem('fcm_token_registered_at', Date.now().toString())
      } catch (error) {
        item.attempts++
        item.lastAttempt = Date.now()

        if (item.attempts >= MAX_RETRIES.MAX_RETRIES) {
          // Max retries reached - remove from queue
          this.queue.shift()
          
          // eslint-disable-next-line no-console
          console.error('[TokenQueue] Max retries reached:', error)
        } else {
          // Schedule retry with exponential backoff
          let delay: number
          if (item.attempts === 1) {
            delay = RETRY_DELAYS.RETRY_DELAY_1
          } else if (item.attempts === 2) {
            delay = RETRY_DELAYS.RETRY_DELAY_2
          } else {
            delay = RETRY_DELAYS.RETRY_DELAY_3
          }
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    this.isProcessing = false
  }

  /**
   * Retry all failed items (call when back online)
   */
  async retryAll() {
    if (this.queue.length > 0) {
      // Reset attempts for items that failed due to network
      this.queue.forEach((item) => {
        if (item.attempts > 0) {
          item.attempts = 0
        }
      })

      await this.process()
    }
  }

  /**
   * Get current queue status
   */
  getQueueStatus() {
    return {
      length: this.queue.length,
      isProcessing: this.isProcessing,
      items: this.queue.map((item) => ({
        platform: item.platform,
        attempts: item.attempts,
        lastAttempt: item.lastAttempt,
      })),
    }
  }

  /**
   * Clear queue (useful for logout)
   */
  clearQueue() {
    this.queue = []
  }

  /**
   * Setup online event listener
   */
  private setupOnlineListener() {
    if (typeof window !== 'undefined') {
      this.onlineHandler = () => {
        this.retryAll()
      }

      window.addEventListener('online', this.onlineHandler)
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.onlineHandler && typeof window !== 'undefined') {
      window.removeEventListener('online', this.onlineHandler)
      this.onlineHandler = null
    }
    this.clearQueue()
  }
}

export const tokenRegistrationQueue = new TokenRegistrationQueue()

