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
          overviewFilter: {
            branch: '',
            startDate: moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
            endDate: moment().format('YYYY-MM-DD HH:mm:ss'),
            type: RevenueTypeQuery.HOURLY,
          },
        })
      },
    }),
    {
      name: 'overview-filter-store',
    },
  ),
)
