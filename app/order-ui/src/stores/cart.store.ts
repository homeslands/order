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
          const newCart = {
            id: item.id,
            slug: item.slug,
            owner: item.owner || '',
            type: item.type,
            orderItems: item.orderItems,
            table: item.table || '',
            tableName: item.tableName || '',
            voucher: null,
            approvalBy: '',
            ownerPhoneNumber: '',
            ownerFullName: '',
          }

          set({
            cartItems: newCart,
            lastModified: moment().valueOf(),
          })
        } else {
          const existingItemIndex = cartItems.orderItems.findIndex(
            (orderItem) =>
              orderItem.variant === item.orderItems[0].variant &&
              orderItem.note === item.orderItems[0].note,
          )

          if (existingItemIndex >= 0) {
            const updatedOrderItems = [...cartItems.orderItems]
            updatedOrderItems[existingItemIndex].quantity +=
              item.orderItems[0].quantity

            set({
              cartItems: {
                ...cartItems,
                orderItems: updatedOrderItems,
              },
              lastModified: moment().valueOf(),
            })
          } else {
            set({
              cartItems: {
                ...cartItems,
                orderItems: [...cartItems.orderItems, ...item.orderItems],
              },
              lastModified: moment().valueOf(),
            })
          }
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
          const updatedOrderItems = cartItems.orderItems.filter(
            (orderItem) => orderItem.id !== cartItemId, // Xóa trực tiếp sản phẩm
          )

          // Nếu đây là sản phẩm cuối cùng, xóa toàn bộ giỏ hàng
          if (updatedOrderItems.length === 0) {
            get().clearCart()
          } else {
            set({
              cartItems: {
                ...cartItems,
                orderItems: updatedOrderItems,
              },
              lastModified: moment().valueOf(), // Thêm cập nhật lastModified để trigger re-render
            })
          }

          showToast(i18next.t('toast.removeSuccess')) // Hiển thị thông báo thành công
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
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
