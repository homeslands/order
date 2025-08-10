import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { IPriceRangeStore } from '@/types'
import { FILTER_VALUE } from '@/constants'

export const usePriceRangeStore = create<IPriceRangeStore>()(
  persist(
    (set) => ({
      minPrice: FILTER_VALUE.MIN_PRICE,
      maxPrice: FILTER_VALUE.MAX_PRICE,
      setPriceRange: (minPrice: number, maxPrice: number) => {
        set({ minPrice, maxPrice })
      },
      clearPriceRange: () => {
        set({
          minPrice: FILTER_VALUE.MIN_PRICE,
          maxPrice: FILTER_VALUE.MAX_PRICE,
        })
      },
    }),
    {
      name: 'price-range-store',
    },
  ),
)
