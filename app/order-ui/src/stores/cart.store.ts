import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import i18next from 'i18next'
import moment from 'moment'

import { showToast } from '@/utils'
import {
  ICartItem,
  ICartItemStore,
  ITable,
  IUserInfo,
  IVoucher,
  OrderTypeEnum,
} from '@/types'
import { setupAutoClearCart } from '@/utils/cart'

export const useCartItemStore = create<ICartItemStore>()(
  persist(
    (set, get) => ({
      cartItems: null,
      lastModified: null,

      getCartItems: () => get().cartItems,

      addCustomerInfo: (owner: IUserInfo) => {
        const { cartItems } = get()
        if (cartItems) {
          const hasFirstName = owner.firstName && owner.firstName.trim() !== ''
          const hasLastName = owner.lastName && owner.lastName.trim() !== ''
          const ownerFullName =
            hasFirstName || hasLastName
              ? `${owner.firstName ?? ''} ${owner.lastName ?? ''}`.trim()
              : ''

          set({
            cartItems: {
              ...cartItems,
              owner: owner.slug,
              ownerPhoneNumber: owner.phonenumber,
              ownerFullName: ownerFullName,
            },
            lastModified: moment().valueOf(),
          })
        }
      },

      removeCustomerInfo: () => {
        const { cartItems } = get()
        if (cartItems) {
          set({
            cartItems: {
              ...cartItems,
              owner: '',
              ownerFullName: '',
              ownerPhoneNumber: '',
            },
            lastModified: moment().valueOf(),
          })
        }
      },

      addApprovalBy: (approvalBy: string) => {
        const { cartItems } = get()
        if (cartItems) {
          set({
            cartItems: { ...cartItems, approvalBy },
            lastModified: moment().valueOf(),
          })
        }
      },

      addCartItem: (item: ICartItem) => {
        const { cartItems } = get()
        const timestamp = moment().valueOf()

        if (!cartItems) {
          const newCart = {
            id: `cart_${timestamp}`,
            slug: `cart_${timestamp}`,
            owner: item.owner || '',
            type: item.type,
            orderItems: item.orderItems.map((orderItem) => ({
              ...orderItem,
              id: `cart_${timestamp}_order_${orderItem.id}`,
            })),
            table: item.table || '',
            tableName: item.tableName || '',
            voucher: null,
            approvalBy: '',
            ownerPhoneNumber: '',
            ownerFullName: '',
          }

          set({
            cartItems: newCart,
            lastModified: timestamp,
          })
        } else {
          const newOrderItems = [
            ...cartItems.orderItems,
            ...item.orderItems.map((orderItem) => ({
              ...orderItem,
              id: `cart_${cartItems.id}_order_${orderItem.id}`,
            })),
          ]
          const newCart = {
            ...cartItems,
            orderItems: newOrderItems,
          }

          set({
            cartItems: newCart,
            lastModified: timestamp,
          })
        }
        showToast(i18next.t('toast.addSuccess'))
        setupAutoClearCart()
      },

      updateCartItemQuantity: (id: string, quantity: number) => {
        const { cartItems } = get()
        if (cartItems) {
          const updatedOrderItems = cartItems.orderItems.map((orderItem) =>
            orderItem.id === id ? { ...orderItem, quantity } : orderItem,
          )

          set({
            cartItems: {
              ...cartItems,
              orderItems: updatedOrderItems,
            },
            lastModified: moment().valueOf(),
          })
        }
      },

      addNote: (id: string, note: string) => {
        const { cartItems } = get()
        if (cartItems) {
          const updatedOrderItems = cartItems.orderItems.map((orderItem) =>
            orderItem.id === id ? { ...orderItem, note } : orderItem,
          )

          set({
            cartItems: {
              ...cartItems,
              orderItems: updatedOrderItems,
            },
            lastModified: moment().valueOf(),
          })
        }
      },

      addOrderNote: (note: string) => {
        const { cartItems } = get()
        if (cartItems) {
          set({ cartItems: { ...cartItems, description: note } })
        }
      },

      addTable: (table: ITable) => {
        const { cartItems } = get()
        if (cartItems) {
          set({
            cartItems: {
              ...cartItems,
              table: table.slug,
              tableName: table.name,
            },
            lastModified: moment().valueOf(),
          })
        }
      },

      removeTable: () => {
        const { cartItems } = get()
        if (cartItems) {
          set({
            cartItems: { ...cartItems, table: '', tableName: '' },
            lastModified: moment().valueOf(),
          })
        }
      },

      addPaymentMethod: () => {
        const { cartItems } = get()
        if (cartItems) {
          set({
            cartItems: { ...cartItems },
            lastModified: moment().valueOf(),
          })
        }
      },

      addOrderType: (orderType: OrderTypeEnum) => {
        const { cartItems } = get()
        if (cartItems) {
          set({
            cartItems: { ...cartItems, type: orderType },
            lastModified: moment().valueOf(),
          })
        }
      },

      removeCartItem: (cartItemId: string) => {
        const { cartItems } = get()
        if (cartItems) {
          const updatedOrderItems = cartItems.orderItems.filter(
            (orderItem) => orderItem.id !== cartItemId,
          )

          if (updatedOrderItems.length === 0) {
            get().clearCart()
          } else {
            set({
              cartItems: {
                ...cartItems,
                orderItems: updatedOrderItems,
              },
              lastModified: moment().valueOf(),
            })
          }

          showToast(i18next.t('toast.removeSuccess'))
        }
      },

      addVoucher: (voucher: IVoucher) => {
        const { cartItems } = get()
        if (cartItems) {
          set({
            cartItems: { ...cartItems, voucher },
            lastModified: moment().valueOf(),
          })
        }
      },

      removeVoucher: () => {
        const { cartItems } = get()
        if (cartItems) {
          set({
            cartItems: { ...cartItems, voucher: null },
            lastModified: moment().valueOf(),
          })
        }
      },

      clearCart: () => {
        set({
          cartItems: null,
          lastModified: null,
        })
      },
    }),
    {
      name: 'cart-store',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        cartItems: state.cartItems,
        lastModified: state.lastModified,
      }),
    },
  ),
)
