import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { IProductNameStore } from '@/types'

export const useProductNameStore = create<IProductNameStore>()(
  persist(
    (set) => ({
      productName: undefined,
      setProductName: (productName?: string) => set({ productName }),
      removeProductName: () => set({ productName: undefined }),
    }),
    {
      name: 'productName-storage',
    },
  ),
)
