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
} from 'lucide-react'

import { useIsMobile } from '@/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/utils'
import { getPointTransactions } from '@/api/point-transaction'
import { IPointTransaction } from '@/types'
import { PointTransactionObjectType, PointTransactionType } from '@/constants'
import { useUserStore } from '@/stores'
import moment from 'moment'
import { TransactionCardSkeleton } from '@/components/app/skeleton/transaction-card-skeleton'
import { Tooltip } from 'react-tooltip'
import { TransactionGiftCardDetailDialog } from '@/components/app/dialog'

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
  const isMobile = useIsMobile()
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastElementRef = useRef<HTMLDivElement | null>(null)
  const { userInfo } = useUserStore()

  const fetchCoinTransactions = useCallback(
    async (page: number, isInitial = false) => {
      if (!userInfo?.slug) {
        return
      }

      if (isInitial) {
        setIsLoading(true)
      } else {
        setLoadingMore(true)
      }

      try {
        const response = await getPointTransactions({
          page,
          size: pageSize,
          userSlug: userInfo.slug,
        })

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
    [pageSize, userInfo?.slug],
  )

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      setCurrentPage((prev) => prev + 1)
    }
  }, [loadingMore, hasMore])

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
    fetchCoinTransactions(1, true)
  }, [fetchCoinTransactions])

  useEffect(() => {
    if (currentPage > 1) {
      fetchCoinTransactions(currentPage)
    }
  }, [currentPage, fetchCoinTransactions])

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
          className={`mb-3 cursor-pointer rounded-md p-3 shadow-sm transition-shadow duration-200 hover:shadow-md ${bgClass} ${borderClass}`}
        >
          <div className="mb-2 flex items-center justify-between">
            <div
              className={`${amountClass} flex items-center text-lg font-bold`}
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
              className={`flex items-center text-xs text-gray-500 dark:text-gray-400 ${isMobile ? 'w-max' : ''}`}
            >
              <Clock size={12} className="mr-1" />
              {isMobile ? (
                <div className="flex flex-col">
                  <span>
                    {moment(transaction.createdAt).format('HH:mm:ss')}
                  </span>
                  <span>
                    {moment(transaction.createdAt).format('DD/MM/YYYY')}
                  </span>
                </div>
              ) : (
                moment(transaction.createdAt).format('HH:mm:ss DD/MM/YYYY')
              )}
            </div>
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

          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Tag size={12} className="mr-1" />
            <span className="mr-2">{t('profile.transactionCode') + ':'}</span>
            <span
              className={`rounded px-2 py-1 font-mono ${
                isGiftCard
                  ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
                  : isOrder
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              {transaction.objectSlug}
            </span>
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
          <CardTitle
            className={`${isMobile ? 'text-sm' : 'text-lg'} flex items-center gap-2`}
          >
            <span className="rounded-full bg-orange-100 p-1 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300">
              <Tag size={isMobile ? 16 : 18} />
            </span>
            {t('profile.coinTransactions')}
            {totalItems > 0 && (
              <span className="ml-2 text-xs text-gray-500">({totalItems})</span>
            )}
          </CardTitle>
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
                  fetchCoinTransactions(1, true)
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
