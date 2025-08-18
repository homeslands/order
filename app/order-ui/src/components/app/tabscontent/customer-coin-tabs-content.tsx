import { useEffect, useRef, useCallback } from 'react'
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
  TrendingUp,
  TrendingDown,
} from 'lucide-react'

import { useIsMobile, usePointTransactions } from '@/hooks'
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
import { IPointTransaction } from '@/types'
import { PointTransactionObjectType, PointTransactionType } from '@/constants'
import { useUserStore } from '@/stores'
import moment from 'moment'
import { TransactionCardSkeleton } from '@/components/app/skeleton/transaction-card-skeleton'
import { Tooltip } from 'react-tooltip'
import { TransactionGiftCardDetailDialog } from '@/components/app/dialog'
import SimpleDatePicker from '@/components/app/picker/simple-date-picker'
import { useState } from 'react'

interface ICustomerCoinTabsContentProps {
  userSlug?: string
}

export function CustomerCoinTabsContent({
  userSlug,
}: ICustomerCoinTabsContentProps) {
  const { t } = useTranslation(['profile'])
  const isMobile = useIsMobile()
  const { userInfo } = useUserStore()

  // Filter panel state
  const [isFilterOpen, setIsFilterOpen] = useState(true)

  // Point transactions hook
  const {
    transactions,
    summary,
    totalCount,
    isLoading,
    loadingAllTransactions,
    isFetchingNextPage,
    isError,
    hasNextPage,
    fetchNextPage,
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    exportAll,
    exportTransaction,
    isExportingAll,
    exportingTransactionSlug,
  } = usePointTransactions({
    userSlug: userSlug ?? userInfo?.slug,
    pageSize: 10,
  })

  // Intersection observer for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastElementRef = useRef<HTMLDivElement | null>(null)

  const handleLoadMore = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage()
    }
  }, [isFetchingNextPage, hasNextPage, fetchNextPage])

  const handleClearFilter = useCallback(() => {
    clearFilters()
    setIsFilterOpen(false)
  }, [clearFilters])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
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
  }, [hasNextPage, isFetchingNextPage, isLoading, handleLoadMore])

  // Coin Summary Cards Component
  const CoinSummaryCards = () => {
    if (loadingAllTransactions) {
      return (
        <div className="mb-6">
          <div
            className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4 lg:grid-cols-3'}`}
          >
            {Array(3)
              .fill(0)
              .map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="mb-2 h-4 rounded bg-gray-200"></div>
                    <div className="h-8 rounded bg-gray-200"></div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )
    }

    const summaryItems = [
      {
        title: t('profile.totalEarned'),
        value: summary.totalEarned,
        icon: TrendingUp,
        color: 'text-green-600',
        bg: 'bg-green-50 dark:bg-green-900/10',
        border: 'border-green-200 dark:border-green-800',
        iconBg:
          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      },
      {
        title: t('profile.totalSpent'),
        value: summary.totalSpent,
        icon: TrendingDown,
        color: 'text-red-600',
        bg: 'bg-red-50 dark:bg-red-900/10',
        border: 'border-red-200 dark:border-red-800',
        iconBg: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      },
      {
        title: t('profile.netDifference'),
        value: summary.netDifference,
        icon: summary.netDifference >= 0 ? ArrowUp : ArrowDown,
        color: summary.netDifference >= 0 ? 'text-green-600' : 'text-red-600',
        bg:
          summary.netDifference >= 0
            ? 'bg-green-50 dark:bg-green-900/10'
            : 'bg-red-50 dark:bg-red-900/10',
        border:
          summary.netDifference >= 0
            ? 'border-green-200 dark:border-green-800'
            : 'border-red-200 dark:border-red-800',
        iconBg:
          summary.netDifference >= 0
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      },
    ]

    return (
      <div className="mb-6">
        <div
          className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4 lg:grid-cols-3'}`}
        >
          {summaryItems.map((item, index) => (
            <Card
              key={index}
              className={`border ${item.border} ${item.bg} shadow-sm transition-shadow hover:shadow-md`}
            >
              <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p
                      className={`mb-1 text-xs font-medium text-gray-600 dark:text-gray-400 ${isMobile ? 'text-[10px]' : ''}`}
                    >
                      {item.title}
                    </p>
                    <div
                      className={`flex items-center gap-1 ${item.color} font-bold ${isMobile ? 'text-lg' : 'text-xl'}`}
                    >
                      <span>{formatCurrency(Math.abs(item.value), '')}</span>
                      <CoinsIcon
                        className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-primary`}
                      />
                    </div>
                  </div>
                  <div className={`rounded-full p-2 ${item.iconBg}`}>
                    <item.icon size={isMobile ? 16 : 20} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

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
            <CoinsIcon className="ml-1 h-5 w-5 text-primary" />
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
                exportTransaction(transaction.slug)
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
      <Card className="overflow-hidden border-none shadow-md dark:bg-transparent">
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
              {totalCount > 0 && (
                <span className="ml-2 text-xs text-gray-500">
                  ({totalCount})
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
                onClick={exportAll}
                disabled={isExportingAll || totalCount === 0}
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
                className={`${hasActiveFilters ? 'border-primary text-primary' : ''} min-w-[120px]`}
              >
                <Filter size={16} className="mr-2" />
                {t('profile.filter')}
                {hasActiveFilters && (
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
                      value={filters.fromDate || ''}
                      onChange={(date) => updateFilters({ fromDate: date })}
                      disableFutureDates={true}
                      maxDate={filters.toDate || undefined}
                      allowEmpty={true}
                    />
                  </div>

                  {/* Date To */}
                  <div className="space-y-2">
                    <Label htmlFor="toDate" className="text-sm font-medium">
                      {t('profile.toDate')}
                    </Label>
                    <SimpleDatePicker
                      value={filters.toDate || ''}
                      onChange={(date) => updateFilters({ toDate: date })}
                      disableFutureDates={true}
                      minDate={filters.fromDate || undefined}
                      allowEmpty={true}
                    />
                  </div>

                  {/* Transaction Type */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {t('profile.transactionType')}
                    </Label>
                    <Select
                      value={filters.type}
                      onValueChange={(value: PointTransactionType) =>
                        updateFilters({ type: value })
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
                          {t('profile.coinEarned')}
                        </SelectItem>
                        <SelectItem value={PointTransactionType.OUT}>
                          {t('profile.coinSpent')}
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
                    disabled={!hasActiveFilters}
                  >
                    <X className="mr-2 h-4 w-4" />
                    {t('profile.clearFilter')}
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
          {/* Coin Summary Cards */}
          <CoinSummaryCards />
        </CardHeader>

        <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
          {isLoading ? (
            // Loading skeleton
            Array(5)
              .fill(0)
              .map((_, index) => (
                <TransactionCardSkeleton key={`skeleton-${index}`} />
              ))
          ) : isError ? (
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
              {isFetchingNextPage && (
                <div className="py-2">
                  <TransactionCardSkeleton />
                </div>
              )}

              {/* End of list message */}
              {!hasNextPage && transactions.length > 0 && (
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
