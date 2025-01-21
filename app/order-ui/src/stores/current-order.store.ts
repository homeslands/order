import { ISelectedOrderStore } from '@/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCurrentOrderStore = create<ISelectedOrderStore>()(
  persist(
    (set) => ({
      orderSlug: '',
      selectedRow: '',
      isSheetOpen: false,
      setOrderSlug: (slug: string) => set({ orderSlug: slug }),
      setSelectedRow: (row: string) => set({ selectedRow: row }),
      setIsSheetOpen: (isOpen: boolean) => set({ isSheetOpen: isOpen }),
      clearSelectedOrder: () =>
        set({
          orderSlug: '',
          selectedRow: '',
          isSheetOpen: false,
        }),
    }),
    {
      name: 'selected-order-store',
    },
  ),
)
