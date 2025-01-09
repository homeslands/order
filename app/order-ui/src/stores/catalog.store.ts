import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ICatalog, ICatalogStore } from '@/types'

export const useCatalogStore = create<ICatalogStore>()(
  persist(
    (set) => ({
      catalog: undefined,
      setCatalog: (catalog?: ICatalog) => set({ catalog }),
      removeCatalog: () => set({ catalog: undefined }),
    }),
    {
      name: 'catalog-storage',
    },
  ),
)
