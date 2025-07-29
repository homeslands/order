import { useState, useCallback, useMemo } from 'react'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import {
  getPointTransactions,
  exportAllPointTransactions,
  exportPointTransactionBySlug,
} from '@/api/point-transaction'
import {
  IPointTransaction,
  IPointTransactionQuery,
  UsePointTransactionsFilters,
} from '@/types'
import { PointTransactionType } from '@/constants'
import { saveAs } from 'file-saver'
import moment from 'moment'

interface UsePointTransactionsProps {
  userSlug?: string
  pageSize?: number
}

export function usePointTransactions({
  userSlug,
  pageSize = 10,
}: UsePointTransactionsProps) {
  const today = moment()
  const [filters, setFilters] = useState<UsePointTransactionsFilters>({
    type: PointTransactionType.ALL,
    fromDate: today.startOf('month').format('YYYY-MM-DD'),
    toDate: today.endOf('month').format('YYYY-MM-DD'),
  })
  const [isExportingAll, setIsExportingAll] = useState(false)
  const [exportingTransactionSlug, setExportingTransactionSlug] = useState<
    string | null
  >(null)

  const {
    data: transactionsData,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['pointTransactions', userSlug, filters],
    queryFn: async ({ pageParam }) => {
      const params: IPointTransactionQuery = {
        page: pageParam as number,
        size: pageSize,
        userSlug,
      }

      // Add filters
      if (filters.fromDate) params.fromDate = filters.fromDate
      if (filters.toDate) params.toDate = filters.toDate
      if (filters.type !== PointTransactionType.ALL) params.type = filters.type

      return getPointTransactions(params)
    },
    enabled: !!userSlug,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.result.hasNext ? lastPage.result.page + 1 : undefined,
  })

  // Query for all transactions (for summary calculation)
  const { data: allTransactionsData, isLoading: loadingAllTransactions } =
    useQuery({
      queryKey: [
        'allPointTransactions',
        userSlug,
        filters.fromDate,
        filters.toDate,
      ],
      queryFn: async () => {
        if (!userSlug) throw new Error('User slug is required')

        try {
          let allTransactions: IPointTransaction[] = []
          let page = 1
          let hasNext = true

          while (hasNext) {
            const params: IPointTransactionQuery = {
              page,
              size: 100, // Large page size for faster fetching
              userSlug,
              fromDate: filters.fromDate,
              toDate: filters.toDate,
            }

            const response = await getPointTransactions(params)
            allTransactions = [...allTransactions, ...response.result.items]
            hasNext = response.result.hasNext
            page++
          }
          return allTransactions
        } catch {
          return []
        }
      },
      enabled: !!userSlug,
      staleTime: 5 * 60 * 1000, // 5 minutes
    })

  // Flatten paginated transactions
  const transactions = useMemo(() => {
    return transactionsData?.pages.flatMap((page) => page.result.items) || []
  }, [transactionsData])

  // Calculate summary statistics
  const summary = useMemo(() => {
    // Filter allTransactionsData by fromDate and toDate if present
    let filteredTransactions = allTransactionsData || []

    if (filters.fromDate) {
      filteredTransactions = filteredTransactions.filter((txn) =>
        moment(txn.createdAt).isSameOrAfter(
          moment(filters.fromDate).startOf('day'),
        ),
      )
    }
    if (filters.toDate) {
      filteredTransactions = filteredTransactions.filter((txn) =>
        moment(txn.createdAt).isSameOrBefore(
          moment(filters.toDate).endOf('day'),
        ),
      )
    }
    const totalEarned = filteredTransactions
      .filter((txn) => txn.type === PointTransactionType.IN)
      .reduce((sum, txn) => sum + Math.abs(txn.points), 0)

    const totalSpent = filteredTransactions
      .filter((txn) => txn.type === PointTransactionType.OUT)
      .reduce((sum, txn) => sum + Math.abs(txn.points), 0)

    const netDifference = totalEarned - totalSpent

    return {
      totalEarned,
      totalSpent,
      netDifference,
    }
  }, [allTransactionsData, filters.fromDate, filters.toDate])

  // Get total count from first page
  const totalCount = transactionsData?.pages[0]?.result.total || 0

  // Update filters
  const updateFilters = useCallback(
    (newFilters: Partial<UsePointTransactionsFilters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }))
    },
    [],
  )

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      type: PointTransactionType.ALL,
    })
  }, [])

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      !!filters.fromDate ||
      !!filters.toDate ||
      filters.type !== PointTransactionType.ALL
    )
  }, [filters])

  // Export all transactions
  const exportAll = useCallback(async () => {
    if (!userSlug) return

    setIsExportingAll(true)
    try {
      const blob = await exportAllPointTransactions(
        userSlug,
        filters.fromDate,
        filters.toDate,
        filters.type == PointTransactionType.ALL ? undefined : filters.type,
      )
      const filename = `point-transactions-${userSlug}-${new Date().toISOString().split('T')[0]}.pdf`
      saveAs(blob, filename)
    } finally {
      setIsExportingAll(false)
    }
  }, [filters.fromDate, filters.toDate, filters.type, userSlug])

  // Export single transaction
  const exportTransaction = useCallback(async (transactionSlug: string) => {
    setExportingTransactionSlug(transactionSlug)
    try {
      const blob = await exportPointTransactionBySlug(transactionSlug)
      const filename = `transaction-${transactionSlug}-${new Date().toISOString().split('T')[0]}.pdf`
      saveAs(blob, filename)
    } finally {
      setExportingTransactionSlug(null)
    }
  }, [])

  return {
    // Data
    transactions,
    summary,
    totalCount,

    // Loading states
    isLoading,
    loadingAllTransactions,
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

    // Export
    exportAll,
    exportTransaction,
    isExportingAll,
    exportingTransactionSlug,

    // Actions
    refetch,
  }
}
