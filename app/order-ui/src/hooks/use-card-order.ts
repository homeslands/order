import { useState, useCallback, useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import moment from 'moment'
import { getCardOrders } from '@/api'
import { CardOrderStatus } from '@/constants'
import { ICardOrderGetRequest } from '@/types/card-order.type'
import { useUserStore } from '@/stores'

interface UseCardOrdersFilters {
  status: CardOrderStatus
  fromDate: string
  toDate: string
  customerSlug?: string
}

export const useGetCardOrdersInfinite = ({ pageSize = 10 }) => {
  const today = moment()
  const { userInfo } = useUserStore()

  const [filters, setFilters] = useState<UseCardOrdersFilters>({
    status: CardOrderStatus.ALL,
    fromDate: today.startOf('month').format('YYYY-MM-DD'),
    toDate: today.endOf('month').format('YYYY-MM-DD'),
    customerSlug: userInfo!.slug,
  })

  const {
    data: cardOrdersData,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['cardOrdersInfinite', filters],
    queryFn: async ({ pageParam }) => {
      const params: ICardOrderGetRequest = {
        page: pageParam as number,
        size: pageSize,
      }

      // Add filters with validation logic
      if (filters.fromDate && filters.toDate) {
        params.fromDate = filters.fromDate
        params.toDate = filters.toDate
      } else if (filters.fromDate && !filters.toDate) {
        params.fromDate = filters.fromDate
      }
      // If toDate without fromDate, don't filter by date

      if (filters.status !== CardOrderStatus.ALL) {
        params.status = filters.status
      }

      if (filters.customerSlug) {
        params.customerSlug = filters.customerSlug
      }

      return getCardOrders(params)
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.result.hasNext ? lastPage.result.page + 1 : undefined,
  })

  // Flatten paginated card orders
  const cardOrders = useMemo(() => {
    return cardOrdersData?.pages.flatMap((page) => page.result.items) || []
  }, [cardOrdersData])

  // Get total count from first page
  const totalCount = cardOrdersData?.pages[0]?.result.total || 0

  // Update filters
  const updateFilters = useCallback(
    (newFilters: Partial<UseCardOrdersFilters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }))
    },
    [],
  )

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      status: CardOrderStatus.ALL,
      fromDate: '',
      toDate: '',
      customerSlug: '',
    })
  }, [])

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      !!filters.fromDate ||
      !!filters.toDate ||
      filters.status !== CardOrderStatus.ALL ||
      !!filters.customerSlug
    )
  }, [filters])

  return {
    // Data
    cardOrders,
    totalCount,

    // Loading states
    isLoading,
    isFetchingNextPage,
    isError,

    // Pagination
    hasNextPage,
    fetchNextPage,

    // Filters
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters,

    // Actions
    refetch,
  }
}
