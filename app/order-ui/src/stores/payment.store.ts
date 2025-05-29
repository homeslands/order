import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { IPaymentStore } from '@/types'
import { PaymentMethod } from '@/constants'

export const usePaymentStore = create<IPaymentStore>()(
  persist(
    (set) => ({
      orderSlug: '',
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      qrCode: '',
      paymentSlug: '',
      setOrderSlug: (orderSlug: string) => set({ orderSlug }),
      setPaymentMethod: (paymentMethod: PaymentMethod) =>
        set({ paymentMethod }),
      setQrCode: (qrCode: string) => set({ qrCode }),
      setPaymentSlug: (paymentSlug: string) => set({ paymentSlug }),
      clearStore: () =>
        set({
          orderSlug: '',
          paymentMethod: PaymentMethod.BANK_TRANSFER,
          qrCode: '',
          paymentSlug: '',
        }),
    }),
    {
      name: 'payment-storage',
    },
  ),
)
