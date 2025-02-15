import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18next from 'i18next'
import moment from 'moment'

import { showToast } from '@/utils'
import {
  ICartItemStore,
  ICartItem,
  ITable,
  OrderTypeEnum,
  IUserInfo,
  IVoucher,
} from '@/types'
import { setupAutoClearCart } from '@/utils/cart'

export const useCartItemStore = create<ICartItemStore>()(
  persist(
    (set, get) => ({
      cartItems: null, // Chỉ lưu một cart item hoặc null nếu không có item nào
      lastModified: null, // Add this field

      getCartItems: () => get().cartItems,

      addCustomerInfo: (owner: IUserInfo) => {
        const { cartItems } = get()
        if (cartItems) {
          set({
            cartItems: {
              ...cartItems,
              owner: owner.slug,
              ownerPhoneNumber: owner.phonenumber,
              ownerFullName: `${owner.firstName} ${owner.lastName}`,
            },
          })
        }
      },

      addApprovalBy: (approvalBy: string) => {
        const { cartItems } = get()
        if (cartItems) {
          set({
            cartItems: { ...cartItems, approvalBy }, // Cập nhật approvalBy cho cartItems
          })
        }
      },

      addCartItem: (item: ICartItem) => {
        const { cartItems } = get()
        if (!cartItems) {
          // If cart is empty, create new cart with the item
          set({
            cartItems: item,
            lastModified: moment().valueOf(), // Update timestamp
          })
        } else {
          // Check if item already exists in cart
          const existingItemIndex = cartItems.orderItems.findIndex(
            (orderItem) => orderItem.id === item.orderItems[0].id,
          )

          if (existingItemIndex >= 0) {
            // If item exists, increase its quantity
            const updatedOrderItems = [...cartItems.orderItems]
            updatedOrderItems[existingItemIndex].quantity +=
              item.orderItems[0].quantity

            set({
              cartItems: {
                ...cartItems,
                orderItems: updatedOrderItems,
              },
              lastModified: moment().valueOf(), // Update timestamp
            })
          } else {
            // If item doesn't exist, add it to the array
            set({
              cartItems: {
                ...cartItems,
                orderItems: [...cartItems.orderItems, ...item.orderItems],
              },
              lastModified: moment().valueOf(), // Update timestamp
            })
          }
        }
        showToast(i18next.t('toast.addSuccess'))
        setupAutoClearCart() // Setup auto clear when adding items
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
          })
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
          })
        }
      },

      removeTable: () => {
        const { cartItems } = get()
        if (cartItems) {
          set({
            cartItems: { ...cartItems, table: '', tableName: '' },
          })
        }
      },

      addPaymentMethod: () => {
        const { cartItems } = get()
        if (cartItems) {
          set({
            cartItems: { ...cartItems },
          })
        }
      },

      addOrderType: (orderType: OrderTypeEnum) => {
        const { cartItems } = get()
        if (cartItems) {
          set({
            cartItems: { ...cartItems, type: orderType },
          })
        }
      },

      removeCartItem: (cartItemId: string) => {
        const { cartItems } = get()
        if (cartItems) {
          const itemToRemove = cartItems.orderItems.find(
            (item) => item.id === cartItemId,
          )
          if (itemToRemove && itemToRemove.quantity > 1) {
            // If quantity > 1, decrease quantity by 1
            const updatedOrderItems = cartItems.orderItems.map((orderItem) =>
              orderItem.id === cartItemId
                ? { ...orderItem, quantity: orderItem.quantity - 1 }
                : orderItem,
            )
            set({
              cartItems: {
                ...cartItems,
                orderItems: updatedOrderItems,
              },
            })
          } else {
            // If quantity is 1, remove the item completely
            const updatedOrderItems = cartItems.orderItems.filter(
              (orderItem) => orderItem.id !== cartItemId,
            )
            set({
              cartItems: {
                ...cartItems,
                orderItems: updatedOrderItems,
              },
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
          })
        }
      },

      removeVoucher: () => {
        const { cartItems } = get()
        if (cartItems) {
          set({
            cartItems: { ...cartItems, voucher: null },
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
    },
  ),
)
