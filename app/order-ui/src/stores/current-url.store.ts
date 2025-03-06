import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ICurrentUrlStore {
  currentUrl: string | null
  setCurrentUrl: (url: string) => void
  clearUrl: () => void
}

export const useCurrentUrlStore = create<ICurrentUrlStore>()(
  persist(
    (set) => ({
      currentUrl: null,
      setCurrentUrl: (url: string) => set({ currentUrl: url }),
      clearUrl: () => set({ currentUrl: null }),
    }),
    {
      name: 'current-url-store',
    },
  ),
)
