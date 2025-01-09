import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ICurrentUrlStore {
  currentUrl: string | null // Lưu trữ URL hiện tại
  setCurrentUrl: (url: string) => void // Cập nhật URL
  clearUrl: () => void // Xóa URL sau khi sử dụng
}

export const useCurrentUrlStore = create<ICurrentUrlStore>()(
  persist(
    (set) => ({
      currentUrl: null,
      setCurrentUrl: (url: string) => set({ currentUrl: url }),
      clearUrl: () => set({ currentUrl: null }),
    }),
    {
      name: 'current-url-store', // Key lưu vào localStorage
    },
  ),
)
