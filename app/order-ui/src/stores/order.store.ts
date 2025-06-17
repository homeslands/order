import {
  IOrder,
  IOrderDetail,
  IOrderStore,
  IOrderTrackingStore,
  IOrderTypeStore,
  OrderTypeEnum,
} from '@/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useOrderStore = create<IOrderStore>()(
  persist(
    (set, get) => ({
      order: null,

      getOrder: () => get().order,

      addOrder: (orderInfo: IOrder) => {
        set((state) => ({
          ...state,
          order: orderInfo,
        }))
      },

      removeOrder: () => {
        set((state) => ({
          ...state,
          order: null,
        }))
      },
    }),
    {
      name: 'order-store',
    },
  ),
)

export const useOrderTypeStore = create<IOrderTypeStore>()(
  persist(
    (set, get) => ({
      orderType: OrderTypeEnum.AT_TABLE,
      table: null,
      getOrderType: () => get().orderType,
      getTable: () => get().table,
      addOrderType: (orderType: OrderTypeEnum) => {
        set((state) => ({
          ...state,
          orderType,
        }))
      },
      addTable: (table: string) => {
        set((state) => ({
          ...state,
          table,
        }))
      },
      removeTable: () => {
        set((state) => ({
          ...state,
          table: null,
        }))
      },
      removeOrderType: () => {
        set((state) => ({
          ...state,
          orderType: OrderTypeEnum.AT_TABLE,
        }))
      },
      clearStore: () => {
        set((state) => ({
          ...state,
          orderType: OrderTypeEnum.AT_TABLE,
          table: null,
        }))
      },
    }),
    {
      name: 'order-type-store',
    },
  ),
)

export const useOrderTrackingStore = create<IOrderTrackingStore>()(
  persist(
    (set, get) => ({
      selectedItems: [],
      getSelectedItems: () => get().selectedItems,
      addSelectedItem: (item: IOrderDetail) => {
        const currentItems = get().selectedItems
        const existingItem = currentItems.find(
          (existing) => existing.slug === item.slug,
        )

        if (existingItem) {
          set({
            selectedItems: currentItems.map((existing) =>
              existing.slug === item.slug
                ? {
                    ...existing,
                    quantity: existing.quantity + 1,
                    subtotal: existing.variant.price * (existing.quantity + 1),
                  }
                : existing,
            ),
          })
        } else {
          set({
            selectedItems: [
              ...currentItems,
              {
                ...item,
                quantity: 1,
                subtotal: item.variant.price,
                slug: item.slug,
              },
            ],
          })
        }
      },

      isItemSelected: (orderId: string, itemIndex: number) => {
        const selectedItems = get().selectedItems
        return selectedItems.some(
          (item) => item.slug === orderId && item.index === itemIndex,
        )
      },

      removeSelectedItem: (itemId: string) => {
        const currentItems = get().selectedItems
        const parts = itemId.split('-')
        const orderId = parts.slice(0, -1).join('-')

        set({
          selectedItems: currentItems
            .map((item) => {
              if (item.slug === orderId) {
                const newQuantity = item.quantity - 1
                if (newQuantity === 0) return null
                return {
                  ...item,
                  quantity: newQuantity,
                  subtotal: item.variant.price * newQuantity,
                }
              }
              return item
            })
            .filter((item): item is IOrderDetail => item !== null),
        })
      },
      clearSelectedItems: () => {
        set({ selectedItems: [] })
      },
    }),
    {
      name: 'order-tracking-store',
    },
  ),
)
