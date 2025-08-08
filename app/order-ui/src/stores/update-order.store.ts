import moment from 'moment'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18next from 'i18next'

import { showToast } from '@/utils'
import {
  IUpdateOrderStore,
  IOrder,
  IOrderToUpdate,
  ITable,
  IVoucher,
  ICartItem,
  OrderTypeEnum,
  IOrderOwner,
  IOriginalOrderStore,
  OrderStatus,
} from '@/types'
import { PaymentMethod } from '@/constants'

const generateOrderId = () => {
  const timestamp = Date.now()
  const shortUuid = crypto.randomUUID().split('-')[0]
  return `order_${timestamp}_${shortUuid}`
}

const generateOrderItemId = () => {
  const timestamp = Date.now()
  const shortUuid = crypto.randomUUID().split('-')[0]
  return `orderItem_${timestamp}_${shortUuid}`
}

export const useUpdateOrderStore = create<IUpdateOrderStore>()(
  persist(
    (set, get) => ({
      orderItems: null,
      isHydrated: false,

      getOrderItems: () => get().orderItems,

      clearStore: () => {
        set({ orderItems: null })
      },

      addCustomerInfo: (owner: IOrderOwner) => {
        const { orderItems } = get()
        if (orderItems) {
          const hasFirstName = owner.firstName && owner.firstName.trim() !== ''
          const hasLastName = owner.lastName && owner.lastName.trim() !== ''
          const ownerFullName =
            hasFirstName || hasLastName
              ? `${owner.firstName ?? ''} ${owner.lastName ?? ''}`.trim()
              : ''

          const userRole = owner.role?.name || ''

          set({
            orderItems: {
              ...orderItems,
              owner: owner.slug,
              ownerPhoneNumber: owner.phonenumber,
              ownerFullName: ownerFullName,
              ownerRole: userRole,
            },
          })
        }
      },

      removeCustomerInfo: () => {
        const { orderItems } = get()
        if (orderItems) {
          // Check if current voucher requires verification
          const requiresVerification =
            orderItems.voucher?.isVerificationIdentity === true

          set({
            orderItems: {
              ...orderItems,
              owner: '',
              ownerFullName: '',
              ownerPhoneNumber: '',
              ownerRole: '',
              // Remove voucher if it requires verification
              voucher: requiresVerification ? null : orderItems.voucher,
            },
          })
        }
      },

      addStatus: (status: OrderStatus) => {
        const { orderItems } = get()
        if (orderItems) {
          set({
            orderItems: { ...orderItems, status },
          })
        }
      },

      removeStatus: () => {
        const { orderItems } = get()
        if (orderItems) {
          set({
            orderItems: { ...orderItems, status: OrderStatus.PENDING },
          })
        }
      },

      addApprovalBy: (approvalBy: string) => {
        const { orderItems } = get()
        if (orderItems) {
          set({
            orderItems: { ...orderItems, approvalBy },
          })
        }
      },

      setOrderItems: (order: IOrder) => {
        // Clear other stores when setting update order data to ensure only update order store has data
        // Import dynamically to avoid circular dependency
        import('./cart.store').then(({ useCartItemStore }) => {
          const { clearCart } = useCartItemStore.getState()
          clearCart()
        })

        import('./payment-method.store').then(({ usePaymentMethodStore }) => {
          const { clearStore: clearPaymentMethodStore } =
            usePaymentMethodStore.getState()
          clearPaymentMethodStore()
        })

        const { orderItems } = get()
        const orderStatus = orderItems ? orderItems.status : OrderStatus.PENDING
        // const orderId = generateUniqueId()
        const timestamp = moment().valueOf()
        const newOrderItems: IOrderToUpdate = {
          id: generateOrderId(),
          slug: order.slug,
          status: orderStatus,
          productSlug: '',
          owner: order.owner?.slug || '',
          paymentMethod: order?.payment?.paymentMethod || '',
          ownerFullName: order.owner?.firstName,
          ownerPhoneNumber: order.owner?.phonenumber,
          type: order.type,
          orderItems: order.orderItems.map((item) => ({
            id: `orderItem_${timestamp}_${item.variant.slug}`,
            slug: item.variant.product.slug,
            image: item.variant.product.image,
            name: item.variant.product.name,
            allVariants: item.variant.product.variants,
            variant: item.variant,
            size: item.variant.size.name,
            quantity: item.quantity,
            originalPrice: item.variant.price,
            promotion: item?.promotion ? item?.promotion : null,
            promotionValue: item?.promotion ? item?.promotion?.value : 0,
            description: item.variant.product.description,
            isLimit: item.variant.product.isLimit,
            note: item.note,
          })),
          table: order.table?.slug,
          tableName: order.table?.name,
          note: order.description || '',
          approvalBy: order.approvalBy?.slug || '',
          voucher: order.voucher || null, // Thêm voucher vào newOrderItems
          payment: {
            orderSlug: order.slug,
            paymentMethod: order?.payment?.paymentMethod as PaymentMethod,
            qrCode: order?.payment?.qrCode,
            paymentSlug: order?.payment?.slug,
          },
        }

        set({ orderItems: newOrderItems })
      },

      addOrderItem: (item: ICartItem) => {
        // Clear other stores when adding item to update order to ensure only update order store has data
        import('./cart.store').then(({ useCartItemStore }) => {
          const { clearCart } = useCartItemStore.getState()
          clearCart()
        })

        import('./payment-method.store').then(({ usePaymentMethodStore }) => {
          const { clearStore: clearPaymentMethodStore } =
            usePaymentMethodStore.getState()
          clearPaymentMethodStore()
        })

        // console.log('Adding order item:', item)
        const { orderItems } = get()
        const orderStatus = orderItems ? orderItems.status : OrderStatus.PENDING
        if (!orderItems) {
          // If order is empty, create new order with the item
          const orderId = generateOrderId()
          const newOrder: IOrderToUpdate = {
            id: orderId,
            slug: generateOrderId(),
            status: orderStatus,
            productSlug: '',
            owner: item.owner || '',
            ownerFullName: item.ownerFullName || '',
            ownerPhoneNumber: item.ownerPhoneNumber || '',
            ownerRole: item.ownerRole || '',
            type: item.type,
            orderItems: item.orderItems.map((orderItem) => ({
              ...orderItem,
              id: generateOrderItemId(),
            })),
            table: item.table || '',
            tableName: item.tableName || '',
            voucher: item.voucher,
            note: item.note || '',
            approvalBy: item.approvalBy || '',
            paymentMethod: item.paymentMethod || '',
            payment: item.payment,
          }
          set({ orderItems: newOrder })
        } else {
          // If order exists, add items to the array
          const newOrderItems = [
            ...orderItems.orderItems,
            ...item.orderItems.map((orderItem) => ({
              ...orderItem,
              id: generateOrderId(),
            })),
          ]

          set({
            orderItems: {
              ...orderItems,
              orderItems: newOrderItems,
            },
          })
        }
        showToast(i18next.t('toast.addSuccess'))
      },

      addProductVariant: (id: string) => {
        const { orderItems } = get()
        if (orderItems) {
          const updatedOrderItems = orderItems.orderItems.map((orderItem) =>
            orderItem.id === id
              ? {
                  ...orderItem,
                  variant: orderItem.variant || [],
                }
              : orderItem,
          )

          set({
            orderItems: {
              ...orderItems,
              orderItems: updatedOrderItems,
            },
          })
        }
      },

      updateOrderItemQuantity: (id: string, quantity: number) => {
        const { orderItems } = get()
        if (orderItems) {
          const updatedOrderItems = orderItems.orderItems.map((orderItem) =>
            orderItem.id === id ? { ...orderItem, quantity } : orderItem,
          )

          set({
            orderItems: {
              ...orderItems,
              orderItems: updatedOrderItems,
            },
          })
        }
      },
      addNote: (id: string, note: string) => {
        const { orderItems } = get()
        if (orderItems) {
          const updatedOrderItems = orderItems.orderItems.map((orderItem) =>
            orderItem.id === id ? { ...orderItem, note } : orderItem,
          )

          set({
            orderItems: {
              ...orderItems,
              orderItems: updatedOrderItems,
            },
          })
        }
      },

      addOrderNote: (note: string) => {
        const { orderItems } = get()
        if (orderItems) {
          set({ orderItems: { ...orderItems, description: note } })
        }
      },

      addTable: (table: ITable) => {
        // Clear other stores when adding table to update order to ensure only update order store has data
        import('./cart.store').then(({ useCartItemStore }) => {
          const { clearCart } = useCartItemStore.getState()
          clearCart()
        })

        import('./payment-method.store').then(({ usePaymentMethodStore }) => {
          const { clearStore: clearPaymentMethodStore } =
            usePaymentMethodStore.getState()
          clearPaymentMethodStore()
        })

        const { orderItems } = get()
        const orderStatus = orderItems ? orderItems.status : OrderStatus.PENDING
        const timestamp = moment().valueOf()

        if (!orderItems) {
          set({
            orderItems: {
              id: `cart_${timestamp}`,
              slug: `cart_${timestamp}`,
              productSlug: '',
              owner: '',
              status: orderStatus,
              type: OrderTypeEnum.AT_TABLE,
              orderItems: [],
              table: table.slug,
              tableName: table.name,
              voucher: null,
              approvalBy: '',
              ownerPhoneNumber: '',
              ownerFullName: '',
            },
          })
        } else {
          set({
            orderItems: {
              ...orderItems,
              table: table.slug,
              tableName: table.name,
            },
          })
        }
      },

      removeTable: () => {
        const { orderItems } = get()
        if (orderItems) {
          set({
            orderItems: { ...orderItems, table: '', tableName: '' },
          })
        }
      },

      addOrderType: (orderType: OrderTypeEnum) => {
        const { orderItems } = get()
        if (orderItems) {
          set({
            orderItems: { ...orderItems, type: orderType },
          })
        }
      },

      addPaymentMethod: (paymentMethod: string) => {
        const { orderItems } = get()
        if (orderItems) {
          set({
            orderItems: { ...orderItems, paymentMethod },
          })
        }
      },

      removeOrderItem: (cartItemId: string) => {
        const { orderItems } = get()
        if (orderItems) {
          const itemToRemove = orderItems.orderItems.find(
            (item) => item.id === cartItemId,
          )
          if (itemToRemove && itemToRemove.quantity > 1) {
            // If quantity > 1, decrease quantity by 1
            const updatedOrderItems = orderItems.orderItems.map((orderItem) =>
              orderItem.id === cartItemId
                ? { ...orderItem, quantity: orderItem.quantity - 1 }
                : orderItem,
            )
            set({
              orderItems: {
                ...orderItems,
                orderItems: updatedOrderItems,
              },
            })
          } else {
            // If quantity is 1, remove the item completely
            const updatedOrderItems = orderItems.orderItems.filter(
              (orderItem) => orderItem.id !== cartItemId,
            )
            set({
              orderItems: {
                ...orderItems,
                orderItems: updatedOrderItems,
              },
            })
          }
          showToast(i18next.t('toast.removeSuccess'))
        }
      },

      addVoucher: (voucher: IVoucher) => {
        const { orderItems } = get()
        if (!orderItems) return

        set({
          orderItems: {
            ...orderItems,
            voucher: {
              voucherGroup: voucher.voucherGroup,
              applicabilityRule: voucher.applicabilityRule,
              createdAt: voucher.createdAt,
              remainingUsage: voucher.remainingUsage || 0,
              startDate: voucher.startDate,
              endDate: voucher.endDate,
              numberOfUsagePerUser: voucher.numberOfUsagePerUser || 0,
              slug: voucher.slug,
              title: voucher.title,
              description: voucher.description || '',
              maxUsage: voucher.maxUsage || 0,
              isActive: voucher.isActive || false,
              value: voucher.value,
              isVerificationIdentity: voucher.isVerificationIdentity || false,
              isPrivate: voucher.isPrivate || false,
              code: voucher.code,
              type: voucher.type,
              minOrderValue: voucher.minOrderValue || 0,
              voucherProducts: voucher.voucherProducts || [],
            },
          },
        })
      },

      removeVoucher: () => {
        const { orderItems } = get()
        if (!orderItems) return

        set({
          orderItems: {
            ...orderItems,
            voucher: null,
          },
        })
      },

      setPaymentMethod: (paymentMethod: string) => {
        const { orderItems } = get()
        if (orderItems) {
          set({
            orderItems: { ...orderItems, paymentMethod },
          })
        }
      },

      setOrderSlug: (orderSlug: string) => {
        const { orderItems } = get()
        if (orderItems) {
          set({
            orderItems: {
              ...orderItems,
              payment: {
                ...orderItems.payment,
                orderSlug,
              },
            },
          })
        }
      },

      setQrCode: (qrCode: string) => {
        const { orderItems } = get()
        if (orderItems) {
          set({
            orderItems: {
              ...orderItems,
              payment: {
                ...orderItems.payment,
                qrCode,
              },
            },
          })
        }
      },

      setPaymentSlug: (paymentSlug: string) => {
        const { orderItems } = get()
        if (orderItems) {
          set({
            orderItems: {
              ...orderItems,
              payment: {
                ...orderItems.payment,
                paymentSlug,
              },
            },
          })
        }
      },
    }),
    {
      name: 'update-order-store',
      onRehydrateStorage: () => (error) => {
        if (error) {
          // Handle hydration error silently
        }

        // Set hydrated flag after store is rehydrated
        queueMicrotask(() => {
          useUpdateOrderStore.setState({ isHydrated: true })
        })
      },
    },
  ),
)

export const useOriginalOrderStore = create<IOriginalOrderStore>()(
  persist(
    (set, get) => ({
      originalOrderItems: null,

      getOriginalOrderItems: () => get().originalOrderItems,

      clearOriginalStore: () => {
        set({ originalOrderItems: null })
      },

      addOriginalCustomerInfo: (owner: IOrderOwner) => {
        const { originalOrderItems } = get()
        if (originalOrderItems) {
          const hasFirstName = owner.firstName && owner.firstName.trim() !== ''
          const hasLastName = owner.lastName && owner.lastName.trim() !== ''
          const ownerFullName =
            hasFirstName || hasLastName
              ? `${owner.firstName ?? ''} ${owner.lastName ?? ''}`.trim()
              : ''

          const userRole = owner.role?.name || ''

          set({
            originalOrderItems: {
              ...originalOrderItems,
              owner: owner.slug,
              ownerPhoneNumber: owner.phonenumber,
              ownerFullName: ownerFullName,
              ownerRole: userRole,
            },
          })
        }
      },

      removeOriginalCustomerInfo: () => {
        const { originalOrderItems } = get()
        if (originalOrderItems) {
          // Check if current voucher requires verification
          const requiresVerification =
            originalOrderItems.voucher?.isVerificationIdentity === true

          set({
            originalOrderItems: {
              ...originalOrderItems,
              owner: '',
              ownerFullName: '',
              ownerPhoneNumber: '',
              ownerRole: '',
              // Remove voucher if it requires verification
              voucher: requiresVerification ? null : originalOrderItems.voucher,
            },
          })
        }
      },

      addOriginalStatus: (status: OrderStatus) => {
        const { originalOrderItems } = get()
        if (originalOrderItems) {
          set({
            originalOrderItems: { ...originalOrderItems, status },
          })
        }
      },

      removeOriginalStatus: () => {
        const { originalOrderItems } = get()
        if (originalOrderItems) {
          set({
            originalOrderItems: {
              ...originalOrderItems,
              status: OrderStatus.PENDING,
            },
          })
        }
      },

      addOriginalApprovalBy: (approvalBy: string) => {
        const { originalOrderItems } = get()
        if (originalOrderItems) {
          set({
            originalOrderItems: { ...originalOrderItems, approvalBy },
          })
        }
      },

      setOriginalOrderItems: (order: IOrder) => {
        const { originalOrderItems } = get()
        const originalOrderStatus = originalOrderItems
          ? originalOrderItems.status
          : OrderStatus.PENDING
        // const orderId = generateUniqueId()
        const timestamp = moment().valueOf()
        const newOriginalOrderItems: IOrderToUpdate = {
          id: generateOrderId(),
          slug: order.slug,
          productSlug: '',
          owner: order.owner?.slug || '',
          status: originalOrderStatus,
          paymentMethod: order?.payment?.paymentMethod || '',
          ownerFullName: order.owner?.firstName,
          ownerPhoneNumber: order.owner?.phonenumber,
          type: order.type,
          orderItems: order.orderItems.map((item) => ({
            id: `orderItem_${timestamp}_${item.variant.slug}`,
            slug: item.variant.product.slug,
            image: item.variant.product.image,
            name: item.variant.product.name,
            allVariants: item.variant.product.variants,
            variant: item.variant,
            size: item.variant.size.name,
            quantity: item.quantity,
            originalPrice: item.variant.price,
            promotion: item?.promotion ? item?.promotion : null,
            promotionValue: item?.promotion ? item?.promotion?.value : 0,
            description: item.variant.product.description,
            isLimit: item.variant.product.isLimit,
            note: item.note,
          })),
          table: order.table?.slug,
          tableName: order.table?.name,
          note: order.description || '',
          approvalBy: order.approvalBy?.slug || '',
          voucher: order.voucher || null, // Thêm voucher vào newOriginalOrderItems
          payment: {
            orderSlug: order.slug,
            paymentMethod: order?.payment?.paymentMethod as PaymentMethod,
            qrCode: order?.payment?.qrCode,
            paymentSlug: order?.payment?.slug,
          },
        }

        set({ originalOrderItems: newOriginalOrderItems })
      },

      addOriginalOrderItem: (item: ICartItem) => {
        // console.log('Adding order item:', item)
        const { originalOrderItems } = get()
        const orderStatus = originalOrderItems
          ? originalOrderItems.status
          : OrderStatus.PENDING
        if (!originalOrderItems) {
          // If order is empty, create new order with the item
          const orderId = generateOrderId()
          const newOrder: IOrderToUpdate = {
            id: orderId,
            slug: generateOrderId(),
            status: orderStatus,
            productSlug: '',
            owner: item.owner || '',
            ownerFullName: item.ownerFullName || '',
            ownerPhoneNumber: item.ownerPhoneNumber || '',
            ownerRole: item.ownerRole || '',
            type: item.type,
            orderItems: item.orderItems.map((orderItem) => ({
              ...orderItem,
              id: generateOrderItemId(),
            })),
            table: item.table || '',
            tableName: item.tableName || '',
            voucher: item.voucher,
            note: item.note || '',
            approvalBy: item.approvalBy || '',
            paymentMethod: item.paymentMethod || '',
            payment: item.payment,
          }
          set({ originalOrderItems: newOrder })
        } else {
          // If order exists, add items to the array
          const newOrderItems = [
            ...originalOrderItems.orderItems,
            ...item.orderItems.map((orderItem) => ({
              ...orderItem,
              id: generateOrderId(),
            })),
          ]

          set({
            originalOrderItems: {
              ...originalOrderItems,
              orderItems: newOrderItems,
            },
          })
        }
        showToast(i18next.t('toast.addSuccess'))
      },

      addOriginalProductVariant: (id: string) => {
        const { originalOrderItems } = get()
        if (originalOrderItems) {
          const updatedOrderItems = originalOrderItems.orderItems.map(
            (orderItem) =>
              orderItem.id === id
                ? {
                    ...orderItem,
                    variant: orderItem.variant || [],
                  }
                : orderItem,
          )

          set({
            originalOrderItems: {
              ...originalOrderItems,
              orderItems: updatedOrderItems,
            },
          })
        }
      },

      updateOriginalOrderItemQuantity: (id: string, quantity: number) => {
        const { originalOrderItems } = get()
        if (originalOrderItems) {
          const updatedOrderItems = originalOrderItems.orderItems.map(
            (orderItem) =>
              orderItem.id === id ? { ...orderItem, quantity } : orderItem,
          )

          set({
            originalOrderItems: {
              ...originalOrderItems,
              orderItems: updatedOrderItems,
            },
          })
        }
      },
      addOriginalNote: (id: string, note: string) => {
        const { originalOrderItems } = get()
        if (originalOrderItems) {
          const updatedOrderItems = originalOrderItems.orderItems.map(
            (orderItem) =>
              orderItem.id === id ? { ...orderItem, note } : orderItem,
          )

          set({
            originalOrderItems: {
              ...originalOrderItems,
              orderItems: updatedOrderItems,
            },
          })
        }
      },

      addOriginalOrderNote: (note: string) => {
        const { originalOrderItems } = get()
        if (originalOrderItems) {
          set({
            originalOrderItems: { ...originalOrderItems, description: note },
          })
        }
      },

      addOriginalTable: (table: ITable) => {
        const { originalOrderItems } = get()
        const orderStatus = originalOrderItems
          ? originalOrderItems.status
          : OrderStatus.PENDING
        const timestamp = moment().valueOf()

        if (!originalOrderItems) {
          set({
            originalOrderItems: {
              id: `cart_${timestamp}`,
              slug: `cart_${timestamp}`,
              productSlug: '',
              owner: '',
              status: orderStatus,
              type: OrderTypeEnum.AT_TABLE,
              orderItems: [],
              table: table.slug,
              tableName: table.name,
              voucher: null,
              approvalBy: '',
              ownerPhoneNumber: '',
              ownerFullName: '',
            },
          })
        } else {
          set({
            originalOrderItems: {
              ...originalOrderItems,
              table: table.slug,
              tableName: table.name,
            },
          })
        }
      },

      removeOriginalTable: () => {
        const { originalOrderItems } = get()
        if (originalOrderItems) {
          set({
            originalOrderItems: {
              ...originalOrderItems,
              table: '',
              tableName: '',
            },
          })
        }
      },

      addOriginalOrderType: (orderType: OrderTypeEnum) => {
        const { originalOrderItems } = get()
        if (originalOrderItems) {
          set({
            originalOrderItems: { ...originalOrderItems, type: orderType },
          })
        }
      },

      addOriginalPaymentMethod: (paymentMethod: string) => {
        const { originalOrderItems } = get()
        if (originalOrderItems) {
          set({
            originalOrderItems: { ...originalOrderItems, paymentMethod },
          })
        }
      },

      removeOriginalOrderItem: (cartItemId: string) => {
        const { originalOrderItems } = get()
        if (originalOrderItems) {
          const itemToRemove = originalOrderItems.orderItems.find(
            (item) => item.id === cartItemId,
          )
          if (itemToRemove && itemToRemove.quantity > 1) {
            // If quantity > 1, decrease quantity by 1
            const updatedOrderItems = originalOrderItems.orderItems.map(
              (orderItem) =>
                orderItem.id === cartItemId
                  ? { ...orderItem, quantity: orderItem.quantity - 1 }
                  : orderItem,
            )
            set({
              originalOrderItems: {
                ...originalOrderItems,
                orderItems: updatedOrderItems,
              },
            })
          } else {
            // If quantity is 1, remove the item completely
            const updatedOrderItems = originalOrderItems.orderItems.filter(
              (orderItem) => orderItem.id !== cartItemId,
            )
            set({
              originalOrderItems: {
                ...originalOrderItems,
                orderItems: updatedOrderItems,
              },
            })
          }
          showToast(i18next.t('toast.removeSuccess'))
        }
      },

      addOriginalVoucher: (voucher: IVoucher) => {
        const { originalOrderItems } = get()
        if (!originalOrderItems) return

        set({
          originalOrderItems: {
            ...originalOrderItems,
            voucher: {
              voucherGroup: voucher.voucherGroup,
              applicabilityRule: voucher.applicabilityRule,
              createdAt: voucher.createdAt,
              remainingUsage: voucher.remainingUsage || 0,
              startDate: voucher.startDate,
              endDate: voucher.endDate,
              numberOfUsagePerUser: voucher.numberOfUsagePerUser || 0,
              slug: voucher.slug,
              title: voucher.title,
              description: voucher.description || '',
              maxUsage: voucher.maxUsage || 0,
              isActive: voucher.isActive || false,
              value: voucher.value,
              isVerificationIdentity: voucher.isVerificationIdentity || false,
              isPrivate: voucher.isPrivate || false,
              code: voucher.code,
              type: voucher.type,
              minOrderValue: voucher.minOrderValue || 0,
              voucherProducts: voucher.voucherProducts || [],
            },
          },
        })
      },

      removeOriginalVoucher: () => {
        const { originalOrderItems } = get()
        if (!originalOrderItems) return

        set({
          originalOrderItems: {
            ...originalOrderItems,
            voucher: null,
          },
        })
      },

      setOriginalPaymentMethod: (paymentMethod: string) => {
        const { originalOrderItems } = get()
        if (originalOrderItems) {
          set({
            originalOrderItems: { ...originalOrderItems, paymentMethod },
          })
        }
      },

      setOriginalOrderSlug: (orderSlug: string) => {
        const { originalOrderItems } = get()
        if (originalOrderItems) {
          set({
            originalOrderItems: {
              ...originalOrderItems,
              payment: {
                ...originalOrderItems.payment,
                orderSlug,
              },
            },
          })
        }
      },

      setOriginalQrCode: (qrCode: string) => {
        const { originalOrderItems } = get()
        if (originalOrderItems) {
          set({
            originalOrderItems: {
              ...originalOrderItems,
              payment: {
                ...originalOrderItems.payment,
                qrCode,
              },
            },
          })
        }
      },

      setOriginalPaymentSlug: (paymentSlug: string) => {
        const { originalOrderItems } = get()
        if (originalOrderItems) {
          set({
            originalOrderItems: {
              ...originalOrderItems,
              payment: {
                ...originalOrderItems.payment,
                paymentSlug,
              },
            },
          })
        }
      },
    }),
    {
      name: 'original-order-store',
    },
  ),
)
