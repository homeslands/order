import { useEffect, useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Coins,
  ArrowUp,
  ArrowDown,
  Clock,
  Tag,
  ShoppingBag,
  Gift,
  CoinsIcon,
  Filter,
  X,
  Download,
} from 'lucide-react'

import { useIsMobile } from '@/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { formatCurrency } from '@/utils'
import { saveAs } from 'file-saver'
import {
  getPointTransactions,
  exportAllPointTransactions,
  exportPointTransactionBySlug,
} from '@/api/point-transaction'
import { IPointTransaction, IPointTransactionQuery } from '@/types'
import { PointTransactionObjectType, PointTransactionType } from '@/constants'
import { useUserStore } from '@/stores'
import moment from 'moment'
import { TransactionCardSkeleton } from '@/components/app/skeleton/transaction-card-skeleton'
import { Tooltip } from 'react-tooltip'
import { TransactionGiftCardDetailDialog } from '@/components/app/dialog'
import SimpleDatePicker from '@/components/app/picker/simple-date-picker'

export function CustomerCoinTabsContent() {
  const { t } = useTranslation(['profile'])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [transactions, setTransactions] = useState<IPointTransaction[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [totalItems, setTotalItems] = useState(0)
  const [hasError, setHasError] = useState(false)

  // Filter states
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [filterType, setFilterType] = useState<PointTransactionType>(
    PointTransactionType.ALL,
  )

  // Export states
  const [isExportingAll, setIsExportingAll] = useState(false)
  const [exportingTransactionSlug, setExportingTransactionSlug] = useState<
    string | null
  >(null)

  const isMobile = useIsMobile()
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastElementRef = useRef<HTMLDivElement | null>(null)
  const { userInfo } = useUserStore()

  // Export all transactions
  const handleExportAll = useCallback(async () => {
    if (!userInfo?.slug) return

    setIsExportingAll(true)
    try {
      const blob = await exportAllPointTransactions(userInfo.slug)
      const filename = `point-transactions-${userInfo.slug}-${new Date().toISOString().split('T')[0]}.pdf`
      saveAs(blob, filename)
    } finally {
      setIsExportingAll(false)
    }
  }, [userInfo?.slug])

  // Export single transaction
  const handleExportTransaction = useCallback(
    async (transactionSlug: string) => {
      setExportingTransactionSlug(transactionSlug)
      try {
        const blob = await exportPointTransactionBySlug(transactionSlug)
        const filename = `transaction-${transactionSlug}-${new Date().toISOString().split('T')[0]}.pdf`
        saveAs(blob, filename)
      } finally {
        setExportingTransactionSlug(null)
      }
    },
    [],
  )

  const fetchCoinTransactions = useCallback(
    async (page: number, isInitial = false, withFilters = false) => {
      if (!userInfo?.slug) {
        return
      }

      if (isInitial) {
        setIsLoading(true)
      } else {
        setLoadingMore(true)
      }

      try {
        const params: IPointTransactionQuery = {
          page,
          size: pageSize,
          userSlug: userInfo.slug,
        }

        // Add filter parameters only when explicitly requested
        if (withFilters) {
          if (fromDate) {
            params.fromDate = fromDate
          }
          if (toDate) {
            params.toDate = toDate
          }
          if (filterType !== PointTransactionType.ALL) {
            params.type = filterType
          }
        }

        const response = await getPointTransactions(params)

        const totalCount = response.result.total
        const hasMoreData = response.result.hasNext

        if (isInitial) {
          setTransactions(response.result.items)
        } else {
          setTransactions((prev) => [...prev, ...response.result.items])
        }

        setHasMore(hasMoreData)
        setTotalItems(totalCount)
        setHasError(false)
      } catch {
        // Set error state for UI feedback
        setHasError(true)
      } finally {
        if (isInitial) {
          setIsLoading(false)
        } else {
          setLoadingMore(false)
        }
      }
    },
    [pageSize, userInfo?.slug, fromDate, toDate, filterType],
  )

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      setCurrentPage((prev) => prev + 1)
    }
  }, [loadingMore, hasMore])

  const handleClearFilter = useCallback(() => {
    // Clear current filter values
    setFromDate('')
    setToDate('')
    setFilterType(PointTransactionType.ALL)

    // Reset pagination and close filter panel
    setCurrentPage(1)
    setTransactions([])
    setIsFilterOpen(false)

    // Directly fetch without filters instead of using shouldRefetch
    fetchCoinTransactions(1, true, false)
  }, [fetchCoinTransactions])

  const hasActiveFilter =
    fromDate || toDate || filterType !== PointTransactionType.ALL

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !loadingMore &&
          !isLoading
        ) {
          handleLoadMore()
        }
      },
      { threshold: 0.5 },
    )

    if (lastElementRef.current) {
      observer.observe(lastElementRef.current)
    }

    observerRef.current = observer

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, loadingMore, isLoading, handleLoadMore])

  useEffect(() => {
    if (currentPage > 1) {
      fetchCoinTransactions(currentPage, false, Boolean(hasActiveFilter))
    }
  }, [currentPage, fetchCoinTransactions, hasActiveFilter])

  // Fetch data when dates or filter type changes
  useEffect(() => {
    // Only trigger if there's a user
    if (userInfo?.slug) {
      // Reset pagination
      setCurrentPage(1)
      setTransactions([])

      // Fetch with current filter values
      fetchCoinTransactions(1, true, true)
    }
  }, [fromDate, toDate, filterType, userInfo?.slug, fetchCoinTransactions])

  // Remove automatic filter effect - only call API when Apply Filter is clicked

  const CoinTransactionCard = ({
    transaction,
  }: {
    transaction: IPointTransaction
  }) => {
    const isAdd = transaction.type === PointTransactionType.IN
    const amountClass = isAdd
      ? 'text-green-600 font-medium'
      : 'text-red-600 font-medium'
    const bgClass = isAdd
      ? 'bg-green-50 dark:bg-green-900/10'
      : 'bg-red-50 dark:bg-red-900/10'
    const borderClass = isAdd
      ? 'border-l-4 border-green-500'
      : 'border-l-4 border-red-500'

    // Determine object type specific styling
    const isGiftCard =
      transaction.objectType === PointTransactionObjectType.GIFT_CARD ||
      PointTransactionObjectType.CARD_ORDER
    const isOrder = transaction.objectType === PointTransactionObjectType.ORDER

    // Get object type icon
    const getTransactionIcon = () => {
      if (isGiftCard) {
        return <Gift size={16} />
      } else if (isOrder) {
        return <ShoppingBag size={16} />
      } else {
        // Default arrow icons
        return isAdd ? <ArrowUp size={16} /> : <ArrowDown size={16} />
      }
    }

    return (
      <TransactionGiftCardDetailDialog transaction={transaction}>
        <div
          className={`mb-3 cursor-pointer rounded-md px-2 py-3 shadow-sm transition-shadow duration-200 hover:shadow-md ${bgClass} ${borderClass}`}
        >
          <div
            className={`${amountClass} mb-2 flex items-center text-lg font-bold`}
          >
            <span
              className={`mr-1 rounded-full p-1 ${
                isAdd
                  ? isGiftCard
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : isOrder
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
              }`}
            >
              {getTransactionIcon()}
            </span>
            {isAdd ? '+ ' : '- '}
            <span className={`${isMobile ? 'text-sm' : 'text-lg'}`}>
              {formatCurrency(Math.abs(transaction.points), '')}
            </span>
            <CoinsIcon className="ml-1 h-5 w-5 text-yellow-500 dark:text-yellow-400" />
          </div>

          <div
            className="mb-2 max-w-[400px] truncate text-sm font-medium text-gray-800 dark:text-gray-200"
            data-tooltip-id="description-tooltip"
            data-tooltip-content={String(transaction.desc)}
          >
            {transaction.desc}
          </div>
          <Tooltip
            id="description-tooltip"
            style={{ width: '13rem' }}
            variant="light"
          />
          <div className="flex items-center justify-between">
            <div
              className={`mt-1 flex w-full items-center text-[10px] text-gray-500 dark:text-gray-400`}
            >
              <Clock size={12} className="mr-1" />
              {moment(transaction.createdAt).format('HH:mm:ss DD/MM/YYYY')}
            </div>
            {/* Export Transaction Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleExportTransaction(transaction.slug)
              }}
              disabled={exportingTransactionSlug === transaction.slug}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Download
                size={14}
                className={
                  exportingTransactionSlug === transaction.slug
                    ? 'animate-pulse'
                    : ''
                }
              />
            </Button>
          </div>
        </div>
      </TransactionGiftCardDetailDialog>
    )
  }

  return (
    <div>
      <Card className="overflow-hidden border-none shadow-md">
        <CardHeader
          className={`${isMobile ? 'px-3 py-2' : 'px-6 py-4'} bg-gray-50 dark:bg-gray-800/50`}
        >
          <div className="flex items-center justify-between gap-2">
            <CardTitle
              className={`${isMobile ? 'text-sm' : 'text-lg'} flex items-center gap-2`}
            >
              <span className="rounded-full bg-orange-100 p-1 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300">
                <Tag size={isMobile ? 16 : 18} />
              </span>
              {t('profile.coinTransactions')}
              {totalItems > 0 && (
                <span className="ml-2 text-xs text-gray-500">
                  ({totalItems})
                </span>
              )}
            </CardTitle>

            {/* Action Buttons */}
            <div
              className={`flex items-center gap-2 ${isMobile && 'flex-col'}`}
            >
              {/* Export Transaction Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportAll}
                disabled={isExportingAll || totalItems === 0}
                className="flex min-w-[120px] items-center gap-2"
              >
                <Download size={16} />
                {t('profile.exportAll')}
              </Button>

              {/* Filter Toggle Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`${hasActiveFilter ? 'border-primary text-primary' : ''} min-w-[120px]`}
              >
                <Filter size={16} className="mr-2" />
                {t('profile.filter')}
                {hasActiveFilter && (
                  <span className="ml-1 text-xl text-primary">•</span>
                )}
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          <Collapsible open={isFilterOpen}>
            <CollapsibleContent className="mt-4">
              <div className="rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {/* Date From */}
                  <div className="space-y-2">
                    <Label htmlFor="fromDate" className="text-sm font-medium">
                      {t('profile.fromDate')}
                    </Label>
                    <SimpleDatePicker
                      value={fromDate}
                      onChange={(date) => setFromDate(date)}
                      disableFutureDates={true}
                      maxDate={toDate || undefined}
                      allowEmpty={true}
                    />
                  </div>

                  {/* Date To */}
                  <div className="space-y-2">
                    <Label htmlFor="toDate" className="text-sm font-medium">
                      {t('profile.toDate')}
                    </Label>
                    <SimpleDatePicker
                      value={toDate}
                      onChange={(date) => setToDate(date)}
                      disableFutureDates={true}
                      minDate={fromDate || undefined}
                      allowEmpty={true}
                    />
                  </div>

                  {/* Transaction Type */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {t('profile.transactionType')}
                    </Label>
                    <Select
                      value={filterType}
                      onValueChange={(value: PointTransactionType) =>
                        setFilterType(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PointTransactionType.ALL}>
                          {t('profile.allTransactions')}
                        </SelectItem>
                        <SelectItem value={PointTransactionType.IN}>
                          {t('profile.giftCardTransaction')}
                        </SelectItem>
                        <SelectItem value={PointTransactionType.OUT}>
                          {t('profile.orderTransaction')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={handleClearFilter}
                    variant="outline"
                    size="sm"
                    disabled={!hasActiveFilter}
                  >
                    <X className="mr-2 h-4 w-4" />
                    {t('profile.clearFilter')}
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardHeader>
        <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
          {isLoading ? (
            // Loading skeleton
            Array(5)
              .fill(0)
              .map((_, index) => (
                <TransactionCardSkeleton key={`skeleton-${index}`} />
              ))
          ) : hasError ? (
            // Error state
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-4 rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                <Coins className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="mb-2 text-lg font-medium">
                {t('profile.errorLoadingTransactions')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('profile.pleaseTryAgainLater')}
              </p>
              <button
                className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90"
                onClick={() => {
                  setHasError(false)
                  if (hasActiveFilter) {
                    fetchCoinTransactions(1, true, true)
                  }
                }}
              >
                {t('profile.tryAgain')}
              </button>
            </div>
          ) : transactions.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-4 rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                <Coins className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-medium">
                {t('profile.noTransactions')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('profile.transactionsWillAppearHere')}
              </p>
            </div>
          ) : (
            // Transaction cards
            <div className="space-y-1">
              {transactions.map((transaction, index) => (
                <div
                  key={transaction.slug}
                  ref={
                    index === transactions.length - 5 ? lastElementRef : null
                  }
                >
                  <CoinTransactionCard transaction={transaction} />
                </div>
              ))}

              {/* Loading more indicator */}
              {loadingMore && (
                <div className="py-2">
                  <TransactionCardSkeleton />
                </div>
              )}

              {/* End of list message */}
              {!hasMore && transactions.length > 0 && (
                <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  {t('profile.noMoreTransactions')}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
