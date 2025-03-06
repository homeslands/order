import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18next from 'i18next'

import { showToast } from '@/utils'
import { IUpdateOrderStore, IOrder, IOrderToUpdate, ITable } from '@/types'

// Add a counter for additional uniqueness
let counter = 0

const generateUniqueId = () => {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substr(2, 5)
  const count = (counter++).toString(36)
  return `${timestamp}-${randomStr}-${count}`
}

export const useUpdateOrderStore = create<IUpdateOrderStore>()(
  persist(
    (set, get) => ({
      orderItems: null, // Chỉ lưu một cart item hoặc null nếu không có item nào

      getOrderItems: () => get().orderItems,
      setOrderItems: (order: IOrder) => {
        const orderId = generateUniqueId()
        const orderItems: IOrderToUpdate = {
          id: orderId,
          slug: order.slug,
          owner: order.owner?.slug,
          paymentMethod: order?.payment?.paymentMethod || '',
          ownerFullName: order.owner?.firstName,
          ownerPhoneNumber: order.owner?.phonenumber,
          type: order.type,
          orderItems: order.orderItems.map((item) => ({
            id: generateUniqueId(), // Each item gets a unique ID
            slug: item.variant.product.slug,
            image: item.variant.product.image,
            name: item.variant.product.name,
            variant: item.variant.slug,
            quantity: item.quantity,
            price: item.variant.price,
            description: item.variant.product.description,
            isLimit: item.variant.product.isLimit,
            note: item.note,
          })),
          table: order.table?.slug,
          tableName: order.table?.name,
          note: '',
          approvalBy: '',
        }

        set({ orderItems })
      },

      addOrderItem: (item: IOrderToUpdate) => {
        const { orderItems } = get()
        if (!orderItems) {
          // If cart is empty, create new cart with the item
          set({ orderItems: item })
        } else {
          // Check if item already exists in cart
          const existingItemIndex = orderItems.orderItems.findIndex(
            (orderItem) => orderItem.id === item.orderItems[0].id,
          )

          if (existingItemIndex >= 0) {
            // If item exists, increase its quantity
            const updatedOrderItems = [...orderItems.orderItems]
            updatedOrderItems[existingItemIndex].quantity +=
              item.orderItems[0].quantity

            set({
              orderItems: {
                ...orderItems,
                orderItems: updatedOrderItems,
              },
            })
          } else {
            // If item doesn't exist, add it to the array
            set({
              orderItems: {
                ...orderItems,
                orderItems: [...orderItems.orderItems, ...item.orderItems],
              },
            })
          }
        }
        showToast(i18next.t('toast.addSuccess'))
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
      addOrderType: (orderType: string) => {
        const { orderItems } = get()
        if (orderItems) {
          set({
            orderItems: { ...orderItems, type: orderType },
          })
        }
      },
      addTable: (table: ITable) => {
        const { orderItems } = get()
        if (orderItems) {
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
    }),
    {
      name: 'update-order-store',
    },
  ),
)
