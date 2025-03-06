import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { IPriceRangeStore } from '@/types'

export const usePriceRangeStore = create<IPriceRangeStore>()(
  persist(
    (set) => ({
      minPrice: 0,
      maxPrice: 10_000_000,
      setPriceRange: (minPrice: number, maxPrice: number) => {
        set({ minPrice, maxPrice })
      },
      clearPriceRange: () => {
        set({ minPrice: 0, maxPrice: 0 })
      },
    }),
    {
      name: 'price-range-store',
    },
  ),
)
