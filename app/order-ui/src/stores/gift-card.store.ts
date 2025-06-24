import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import i18next from 'i18next'
import moment from 'moment'

import { showToast } from '@/utils'
import { IGiftCardCartItem } from '@/types'

interface IGiftCardStore {
  giftCardItem: IGiftCardCartItem | null
  lastModified: number | null
  isHydrated: boolean
  getGiftCardItem: () => IGiftCardCartItem | null
  setGiftCardItem: (item: IGiftCardCartItem) => void
  updateGiftCardQuantity: (quantity: number) => void
  clearGiftCard: (showNotification?: boolean) => void
  synchronizeWithServer: (serverItem: IGiftCardCartItem | null) => void
}

export const useGiftCardStore = create<IGiftCardStore>()(
  persist(
    (set, get) => ({
      giftCardItem: null,
      lastModified: null,
      isHydrated: false,

      getGiftCardItem: () => get().giftCardItem,
      setGiftCardItem: (item: IGiftCardCartItem) => {
        if (!get().isHydrated) {
          return
        }
        const timestamp = moment().valueOf()

        set({
          giftCardItem: item,
          lastModified: timestamp,
        })
        showToast(i18next.t('toast.addGiftCardSuccess'))
      },

      updateGiftCardQuantity: (quantity: number) => {
        const { giftCardItem } = get()
        if (giftCardItem) {
          set({
            giftCardItem: { ...giftCardItem, quantity },
            lastModified: moment().valueOf(),
          })
        }
      },
      clearGiftCard: (showNotification = true) => {
        set({
          giftCardItem: null,
          lastModified: null,
        })
        if (showNotification) {
          showToast(i18next.t('toast.removeGiftCardSuccess'))
        }
      },

      synchronizeWithServer: (serverItem: IGiftCardCartItem | null) => {
        const { giftCardItem } = get()

        // If we have server data and it's different from local data
        if (serverItem) {
          // If we don't have a local item or the server data is newer/different
          if (
            !giftCardItem ||
            giftCardItem.slug !== serverItem.slug ||
            giftCardItem.price !== serverItem.price ||
            giftCardItem.title !== serverItem.title ||
            giftCardItem.isActive !== serverItem.isActive
          ) {
            // Preserve local quantity if possible
            const quantity =
              giftCardItem?.slug === serverItem.slug
                ? giftCardItem.quantity
                : serverItem.quantity

            set({
              giftCardItem: { ...serverItem, quantity },
              lastModified: moment().valueOf(),
            })
          }
        } else if (serverItem === null && giftCardItem) {
          // If the item has been removed from the server but exists locally
          set({
            giftCardItem: null,
            lastModified: null,
          })
        }
      },
    }),
    {
      name: 'gift-card-store',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        giftCardItem: state.giftCardItem,
        lastModified: state.lastModified,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          setTimeout(() => {
            useGiftCardStore.setState({ isHydrated: true })
          }, 0)
        }
      },
    },
  ),
)
