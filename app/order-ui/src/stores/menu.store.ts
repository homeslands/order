import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { IAddMenuItemRequest, IMenuItemStore } from '@/types'

export const menuItemStore = create<IMenuItemStore>()(
  persist(
    (set, get) => ({
      menuItems: [],
      getMenuItems: () => get().menuItems,
      addMenuItem: (item: IAddMenuItemRequest) =>
        set((state) => ({
          menuItems: state.menuItems.some(
            (mi) => mi.productSlug === item.productSlug,
          )
            ? state.menuItems
            : [...state.menuItems, item],
        })),
      removeMenuItem: (productSlug: string) =>
        set((state) => ({
          menuItems: state.menuItems.filter(
            (item) => item.productSlug !== productSlug,
          ),
        })),
      clearMenuItems: () => set({ menuItems: [] }),
    }),
    {
      name: 'menu-items-storage',
    },
  ),
)
