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
        // Clear other stores when setting payment method to ensure only payment store has data
        import('./cart.store').then(({ useCartItemStore }) => {
          const { clearCart } = useCartItemStore.getState()
          clearCart()
        })

        import('./update-order.store').then(({ useUpdateOrderStore }) => {
          const { clearStore: clearUpdateOrderStore } =
            useUpdateOrderStore.getState()
          clearUpdateOrderStore()
        })

        set({ paymentMethod: value })
      },
      setQrCode: (value: string) => {
        // Clear other stores when setting QR code to ensure only payment store has data
        import('./cart.store').then(({ useCartItemStore }) => {
          const { clearCart } = useCartItemStore.getState()
          clearCart()
        })

        import('./update-order.store').then(({ useUpdateOrderStore }) => {
          const { clearStore: clearUpdateOrderStore } =
            useUpdateOrderStore.getState()
          clearUpdateOrderStore()
        })

        set({ qrCode: value })
      },
      setOrderSlug: (value: string) => {
        // Clear other stores when setting order slug to ensure only payment store has data
        import('./cart.store').then(({ useCartItemStore }) => {
          const { clearCart } = useCartItemStore.getState()
          clearCart()
        })

        import('./update-order.store').then(({ useUpdateOrderStore }) => {
          const { clearStore: clearUpdateOrderStore } =
            useUpdateOrderStore.getState()
          clearUpdateOrderStore()
        })

        set({ orderSlug: value })
      },
      paymentSlug: '',
      setPaymentSlug: (value: string) => {
        // Clear other stores when setting payment slug to ensure only payment store has data
        import('./cart.store').then(({ useCartItemStore }) => {
          const { clearCart } = useCartItemStore.getState()
          clearCart()
        })

        import('./update-order.store').then(({ useUpdateOrderStore }) => {
          const { clearStore: clearUpdateOrderStore } =
            useUpdateOrderStore.getState()
          clearUpdateOrderStore()
        })

        set({ paymentSlug: value })
      },
      clearPaymentData: () => {
        set({
          paymentMethod: PaymentMethod.BANK_TRANSFER,
          qrCode: '',
          orderSlug: '',
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
