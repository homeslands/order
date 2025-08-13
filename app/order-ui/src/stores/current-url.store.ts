import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ICurrentUrlStore {
  currentUrl: string | null
  lastSetTime: number | null
  setCurrentUrl: (url: string) => void
  clearUrl: () => void
  shouldUpdateUrl: (url: string) => boolean
}

export const useCurrentUrlStore = create<ICurrentUrlStore>()(
  persist(
    (set, get) => ({
      currentUrl: null,
      lastSetTime: null,
      setCurrentUrl: (url: string) => {
        const now = Date.now()
        set({
          currentUrl: url,
          lastSetTime: now,
        })
      },
      clearUrl: () =>
        set({
          currentUrl: null,
          lastSetTime: null,
        }),
      shouldUpdateUrl: (url: string) => {
        const { currentUrl, lastSetTime } = get()
        const now = Date.now()

        // Nếu chưa có currentUrl, allow update
        if (!currentUrl) return true

        // Nếu URL khác với current, allow update
        if (currentUrl !== url) return true

        // Nếu cùng URL nhưng đã lâu (>5s), allow update
        if (lastSetTime && now - lastSetTime > 5000) return true

        // Otherwise, don't update để tránh spam
        return false
      },
    }),
    {
      name: 'current-url-store',
    },
  ),
)
