import moment from 'moment'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { IMenuFilter, IMenuFilterStore } from '@/types'
import { FILTER_VALUE } from '@/constants'

const defaultMenuFilter: IMenuFilter = {
  date: moment().format('YYYY-MM-DD'),
  branch: undefined,
  minPrice: FILTER_VALUE.MIN_PRICE,
  maxPrice: FILTER_VALUE.MAX_PRICE,
  catalog: undefined,
  productName: undefined,
  menu: undefined,
}

export const useMenuFilterStore = create<IMenuFilterStore>()(
  persist(
    (set) => ({
      menuFilter: defaultMenuFilter,
      setMenuFilter: (
        menuFilter: IMenuFilter | ((prev: IMenuFilter) => IMenuFilter),
      ) => {
        set((state) => ({
          menuFilter:
            typeof menuFilter === 'function'
              ? menuFilter(state.menuFilter)
              : menuFilter,
        }))
      },
      clearMenuFilter: () => {
        set({
          menuFilter: {
            date: moment().format('YYYY-MM-DD'),
            branch: undefined,
            minPrice: FILTER_VALUE.MIN_PRICE,
            maxPrice: FILTER_VALUE.MAX_PRICE,
            catalog: undefined,
            productName: undefined,
            menu: undefined,
          },
        })
      },
    }),
    {
      name: 'menu-filter-store',
    },
  ),
)
