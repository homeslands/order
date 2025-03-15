import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { IPaymentMethodStore } from '@/types'
import { PaymentMethod } from '@/constants'

export const usePaymentMethodStore = create<IPaymentMethodStore>()(
  persist(
    (set) => ({
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      qrCode: '',
      setPaymentMethod: (value: PaymentMethod) => {
        set({ paymentMethod: value })
      },
      setQrCode: (value: string) => {
        set({ qrCode: value })
      },
      clearStore: () => {
        set({ paymentMethod: PaymentMethod.BANK_TRANSFER, qrCode: '' })
      },
    }),
    {
      name: 'payment-storage',
    },
  ),
)
