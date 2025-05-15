import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { IPaymentStore } from '@/types'

export const usePaymentStore = create<IPaymentStore>()(
  persist(
    (set) => ({
      orderSlug: '',
      setOrderSlug: (orderSlug: string) => set({ orderSlug }),
      clearStore: () => set({ orderSlug: '' }),
    }),
    {
      name: 'payment-storage',
    },
  ),
)
