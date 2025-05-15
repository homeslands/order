import { IChefOrders, ISelectedChefOrderStore } from '@/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSelectedChefOrderStore = create<ISelectedChefOrderStore>()(
  persist(
    (set) => ({
      chefOrderByChefAreaSlug: '',
      selectedRow: '',
      isSheetOpen: false,
      chefOrderStatus: '',
      setChefOrderByChefAreaSlug: (slug: string) =>
        set({ chefOrderByChefAreaSlug: slug }),
      setChefOrder: (chefOrder: IChefOrders) => set({ chefOrder }),
      setSelectedRow: (row: string) => set({ selectedRow: row }),
      setIsSheetOpen: (isOpen: boolean) => set({ isSheetOpen: isOpen }),
      setChefOrderStatus: (status: string) => set({ chefOrderStatus: status }),
      clearSelectedChefOrder: () =>
        set({
          chefOrderByChefAreaSlug: '',
          selectedRow: '',
          isSheetOpen: false,
        }),
    }),
    { name: 'selected-chef-order-store' },
  ),
)
