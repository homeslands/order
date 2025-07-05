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
import { Role } from '@/constants'

export const useCartItemStore = create<ICartItemStore>()(
  persist(
    (set, get) => ({
      cartItems: null,
      lastModified: null,
      isHydrated: false,

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
              ownerRole: owner.role.name,
            },
            lastModified: moment().valueOf(),
          })
        }
      },

      removeCustomerInfo: () => {
        const { cartItems } = get()
        if (cartItems) {
          // Check if current voucher requires verification
          const requiresVerification =
            cartItems.voucher?.isVerificationIdentity === true

          set({
            cartItems: {
              ...cartItems,
              owner: '',
              ownerFullName: '',
              ownerPhoneNumber: '',
              ownerRole: '',
              // Remove voucher if it requires verification
              voucher: requiresVerification ? null : cartItems.voucher,
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
        if (!get().isHydrated) {
          return
        }
        const timestamp = moment().valueOf()
        const { cartItems } = get()

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
            ownerRole: Role.CUSTOMER,
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

          set({
            cartItems: {
              ...cartItems,
              orderItems: newOrderItems,
            },
            lastModified: timestamp,
          })
        }
        showToast(i18next.t('toast.addSuccess'))
        setupAutoClearCart()
      },

      addProductVariant: (id: string) => {
        const { cartItems } = get()
        if (cartItems) {
          const updatedOrderItems = cartItems.orderItems.map((orderItem) =>
            orderItem.id === id
              ? {
                  ...orderItem,
                  variant: orderItem.variant || [],
                }
              : orderItem,
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
        const timestamp = moment().valueOf()

        if (!cartItems) {
          set({
            cartItems: {
              id: `cart_${timestamp}`,
              slug: `cart_${timestamp}`,
              owner: '',
              type: OrderTypeEnum.AT_TABLE,
              orderItems: [],
              table: table.slug,
              tableName: table.name,
              voucher: null,
              approvalBy: '',
              ownerPhoneNumber: '',
              ownerFullName: '',
            },
            lastModified: timestamp,
          })
        } else {
          set({
            cartItems: {
              ...cartItems,
              table: table.slug,
              tableName: table.name,
            },
            lastModified: timestamp,
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

      addPaymentMethod: (paymentMethod: string) => {
        const { cartItems } = get()
        if (cartItems) {
          set({
            cartItems: { ...cartItems, paymentMethod },
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
        if (!cartItems) return

        set({
          cartItems: {
            ...cartItems,
            voucher: {
              slug: voucher.slug,
              value: voucher.value,
              isVerificationIdentity: voucher.isVerificationIdentity || false,
              isPrivate: voucher.isPrivate || false,
              code: voucher.code,
              type: voucher.type,
              minOrderValue: voucher.minOrderValue || 0,
              voucherProducts: voucher.voucherProducts || [],
            },
            // orderItems giữ nguyên, không tính toán gì
          },
          lastModified: moment().valueOf(),
        })
      },

      // addVoucher: (voucher: IVoucher) => {
      //   const { cartItems } = get()
      //   if (!cartItems) return

      //   const orderItems = cartItems.orderItems
      //   const applicableProducts =
      //     voucher.voucherProducts?.map((p) => p.product.slug) || []
      //   const updatedOrderItems = [...orderItems]

      //   for (let i = 0; i < updatedOrderItems.length; i++) {
      //     const item = updatedOrderItems[i]
      //     const originalPrice = item.originalPrice ?? item.price
      //     let voucherDiscount = 0
      //     let finalPrice = originalPrice

      //     if (voucher.type === VOUCHER_TYPE.SAME_PRICE_PRODUCT) {
      //       // Chỉ áp dụng nếu sản phẩm nằm trong danh sách voucherProducts
      //       if (applicableProducts.includes(item.slug)) {
      //         // Bỏ qua promotion, giảm theo originalPrice
      //         voucherDiscount = Math.max(
      //           0,
      //           (originalPrice || 0) - voucher.value,
      //         )
      //         finalPrice = Math.max(0, voucher.value)
      //       } else {
      //         // Nếu không thuộc sản phẩm trong voucher, giữ nguyên promotion nếu có
      //         const promotionDiscount = item.promotionDiscount ?? 0
      //         finalPrice = Math.max(0, (originalPrice || 0) - promotionDiscount)
      //       }
      //     }

      //     // Các type khác nếu có (giữ nguyên hoặc thêm sau)
      //     else {
      //       const promotionDiscount = item.promotionDiscount ?? 0

      //       if (voucher.type === VOUCHER_TYPE.PERCENT_ORDER) {
      //         voucherDiscount =
      //           (((originalPrice || 0) - promotionDiscount) * voucher.value) /
      //           100
      //       } else if (voucher.type === VOUCHER_TYPE.FIXED_VALUE) {
      //         const perItemDiscount = voucher.value / orderItems.length
      //         voucherDiscount = Math.min(
      //           (originalPrice || 0) - promotionDiscount,
      //           perItemDiscount,
      //         )
      //       }

      //       finalPrice = Math.max(
      //         0,
      //         (originalPrice || 0) - promotionDiscount - voucherDiscount,
      //       )
      //     }

      //     updatedOrderItems[i] = {
      //       ...item,
      //       voucherDiscount,
      //       price: finalPrice,
      //     }
      //   }

      //   set({
      //     cartItems: {
      //       ...cartItems,
      //       orderItems: updatedOrderItems,
      //       voucher: {
      //         slug: voucher.slug,
      //         value: voucher.value,
      //         isVerificationIdentity: voucher.isVerificationIdentity || false,
      //         isPrivate: voucher.isPrivate || false,
      //         code: voucher.code,
      //         type: voucher.type,
      //         minOrderValue: voucher.minOrderValue || 0,
      //         voucherProducts: voucher.voucherProducts || [],
      //       },
      //     },
      //     lastModified: moment().valueOf(),
      //   })
      // },

      removeVoucher: () => {
        const { cartItems } = get()
        if (!cartItems) return

        const updatedOrderItems = cartItems.orderItems.map((item) => {
          const originalPrice = item.originalPrice ?? item.price
          const promotionDiscount = item.promotionDiscount ?? 0
          const finalPrice = Math.max(
            0,
            (originalPrice || 0) - promotionDiscount,
          )

          return {
            ...item,
            voucherDiscount: 0,
            price: finalPrice,
          }
        })

        set({
          cartItems: {
            ...cartItems,
            orderItems: updatedOrderItems,
            voucher: null,
          },
          lastModified: moment().valueOf(),
        })
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
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cartItems: state.cartItems,
        lastModified: state.lastModified,
      }),
      onRehydrateStorage: () => (state) => {
      if (state) {
        setTimeout(() => {
          if (!useCartItemStore.getState().isHydrated) {
            useCartItemStore.setState({ isHydrated: true })
          }
        }, 0)
      }
    }
    },
  ),
)
