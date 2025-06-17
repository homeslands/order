import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { IPaymentMethodStore } from '@/types'
import { PaymentMethod } from '@/constants'

export const usePaymentMethodStore = create<IPaymentMethodStore>()(
  persist(
    (set) => ({
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      qrCode: '',
      orderSlug: '',
      setPaymentMethod: (value: PaymentMethod) => {
        set({ paymentMethod: value })
      },
      setQrCode: (value: string) => {
        set({ qrCode: value })
      },
      setOrderSlug: (value: string) => {
        set({ orderSlug: value })
      },
      paymentSlug: '',
      setPaymentSlug: (value: string) => {
        set({ paymentSlug: value })
      },
      clearPaymentData: () => {
        set({
          paymentMethod: PaymentMethod.BANK_TRANSFER,
          qrCode: '',
          paymentSlug: '',
        })
      },
      clearStore: () => {
        set({
          paymentMethod: PaymentMethod.BANK_TRANSFER,
          qrCode: '',
          paymentSlug: '',
          orderSlug: '',
        })
      },
    }),
    {
      name: 'payment-storage',
    },
  ),
)
