import moment from 'moment'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { IOverviewFilter, IOverviewFilterStore } from '@/types'
import { RevenueTypeQuery } from '@/constants'

const defaultOverviewFilter: IOverviewFilter = {
  branch: '',
  startDate: moment().format('YYYY-MM-DD'),
  endDate: moment().format('YYYY-MM-DD'),
  type: RevenueTypeQuery.DAILY,
}

export const useOverviewFilterStore = create<IOverviewFilterStore>()(
  persist(
    (set) => ({
      overviewFilter: defaultOverviewFilter,
      setOverviewFilter: (
        overviewFilter:
          | IOverviewFilter
          | ((prev: IOverviewFilter) => IOverviewFilter),
      ) => {
        set((state) => ({
          overviewFilter:
            typeof overviewFilter === 'function'
              ? overviewFilter(state.overviewFilter)
              : overviewFilter,
        }))
      },
      clearOverviewFilter: () => {
        set({
          overviewFilter: defaultOverviewFilter,
        })
      },
      resetToDefault: () => {
        set({
          overviewFilter: defaultOverviewFilter,
        })
      },
    }),
    {
      name: 'overview-filter-store',
      // Clear store khi page refresh
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.overviewFilter = defaultOverviewFilter
        }
      },
    },
  ),
)
