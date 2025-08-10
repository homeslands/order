import { useEffect, useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Package,
  Filter,
  X,
  CheckCircle,
  XCircle,
  Loader,
  CoinsIcon,
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
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/utils'
import { useGetCardOrdersInfinite } from '@/hooks'
import { CardOrderStatus, publicFileURL } from '@/constants'
import { ICardOrderResponse } from '@/types'
import moment from 'moment'
import { TransactionCardSkeleton } from '@/components/app/skeleton/transaction-card-skeleton'
import SimpleDatePicker from '@/components/app/picker/simple-date-picker'
import { Collapsible, CollapsibleContent } from '@radix-ui/react-collapsible'
import { GiftCardOrderDetailsSheet } from './gift-card-order-details-sheet'

export function CustomerGiftCardOrderTabsContent() {
  const { t } = useTranslation(['profile'])
  const isMobile = useIsMobile()

  const [isFilterOpen, setIsFilterOpen] = useState(true)
  const [selectedCardOrder, setSelectedCardOrder] =
    useState<ICardOrderResponse | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const {
    cardOrders,
    totalCount,
    isLoading,
    isFetchingNextPage,
    isError,
    hasNextPage,
    fetchNextPage,
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    refetch,
  } = useGetCardOrdersInfinite({ pageSize: 10 })

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

  const toggleCardExpansion = useCallback((cardOrder: ICardOrderResponse) => {
    setSelectedCardOrder(cardOrder)
    setIsSheetOpen(true)
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case CardOrderStatus.COMPLETED:
        return {
          variant: 'default' as const,
          label: t('profile.cardOrder.status.completed'),
          icon: <CheckCircle size={14} />,
          color: 'text-green-600',
        }
      case CardOrderStatus.PENDING:
        return {
          variant: 'secondary' as const,
          label: t('profile.cardOrder.status.pending'),
          icon: <Loader size={14} />,
          color: 'text-yellow-600',
        }
      case CardOrderStatus.FAILED:
        return {
          variant: 'destructive' as const,
          label: t('profile.cardOrder.status.failed'),
          icon: <XCircle size={14} />,
          color: 'text-red-600',
        }
      case CardOrderStatus.CANCELLED:
        return {
          variant: 'outline' as const,
          label: t('profile.cardOrder.status.cancelled'),
          icon: <XCircle size={14} />,
          color: 'text-gray-600',
        }
      default:
        return {
          variant: 'outline' as const,
          label: status,
          icon: null,
          color: 'text-gray-600',
        }
    }
  }

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

  const CardOrderItem = ({ cardOrder }: { cardOrder: ICardOrderResponse }) => {
    const statusBadge = getStatusBadge(cardOrder.status)

    return (
      <div
        key={cardOrder.slug}
        className="mt-2 flex flex-col gap-4 rounded-lg border bg-white p-0 dark:bg-transparent"
      >
        {/* Header with timestamp and status */}
        <div className="flex w-full items-center gap-4 border-b bg-primary/15 p-4 dark:bg-muted-foreground/10">
          <span className="text-xs text-muted-foreground">
            {moment(cardOrder.orderDate || cardOrder.createdAt).format(
              'HH:mm:ss DD/MM/YYYY',
            )}
          </span>
          <Badge variant={statusBadge.variant} className="px-2 py-1">
            <div className="flex items-center gap-1">
              {statusBadge.icon}
              {statusBadge.label}
            </div>
          </Badge>
        </div>

        <div className="px-4 pb-4">
          {/* Main card content */}
          <div className="grid grid-cols-12 gap-2 py-4">
            <div className="relative col-span-3 sm:col-span-2">
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-md">
                <img
                  src={`${publicFileURL}/${cardOrder.cardImage}`}
                  alt={cardOrder.cardImage}
                  className="h-full w-full rounded-md object-contain"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-white sm:-right-4 sm:h-10 sm:w-10 sm:text-sm lg:right-4 xl:-right-4">
                x{cardOrder.quantity}
              </div>
            </div>

            <div className="col-span-9 flex flex-col justify-between sm:col-span-10">
              <div className="flex flex-col gap-1">
                <span className="flex flex-col gap-1 truncate text-sm font-semibold sm:flex-row sm:text-base">
                  {cardOrder.cardTitle}
                </span>
              </div>

              <div className="flex w-full justify-end">
                <div className="flex items-center gap-1">
                  <span className="flex items-center gap-1 text-sm text-primary sm:text-base">
                    {formatCurrency(cardOrder.cardPoint, '')}{' '}
                    <CoinsIcon className="h-4 w-4 text-primary" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Total section */}
          <div className="mt-4 flex w-full justify-end">
            <div className="flex w-[20rem] flex-col justify-end gap-2">
              <div className="flex flex-col border-t">
                <div className="flex w-full justify-between">
                  <h3 className="text-md font-semibold">
                    {t('profile.cardOrder.totalPayment')}
                  </h3>
                  <p className="text-lg font-extrabold text-primary">
                    {formatCurrency(cardOrder.totalAmount)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Button onClick={() => toggleCardExpansion(cardOrder)}>
            {t('profile.common.viewDetails')}
          </Button>
        </div>
      </div>
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
              <span className="rounded-full bg-purple-100 p-1 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">
                <Package size={isMobile ? 16 : 18} />
              </span>
              {t('profile.cardOrder.orders')}
              {totalCount > 0 && (
                <span className="ml-2 text-xs text-gray-500">
                  ({totalCount})
                </span>
              )}
            </CardTitle>

            {/* Filter Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`${hasActiveFilters ? 'border-primary text-primary' : ''} min-w-[120px]`}
            >
              <Filter size={16} className="mr-2" />
              {t('profile.common.filter')}
              {hasActiveFilters && (
                <span className="ml-1 text-xl text-primary">•</span>
              )}
            </Button>
          </div>

          {/* Filter Panel */}
          <Collapsible open={isFilterOpen}>
            <CollapsibleContent className="mt-4">
              <div className="rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {/* Date From */}
                  <div className="space-y-2">
                    <Label htmlFor="fromDate" className="text-sm font-medium">
                      {t('profile.common.fromDate')}
                    </Label>
                    <SimpleDatePicker
                      value={filters.fromDate}
                      onChange={(date) => updateFilters({ fromDate: date })}
                      disableFutureDates={true}
                      maxDate={filters.toDate || undefined}
                      allowEmpty={true}
                    />
                  </div>

                  {/* Date To */}
                  <div className="space-y-2">
                    <Label htmlFor="toDate" className="text-sm font-medium">
                      {t('profile.common.toDate')}
                    </Label>
                    <SimpleDatePicker
                      value={filters.toDate}
                      onChange={(date) => updateFilters({ toDate: date })}
                      disableFutureDates={true}
                      minDate={filters.fromDate || undefined}
                      allowEmpty={true}
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {t('profile.cardOrder.status.label')}
                    </Label>
                    <Select
                      value={filters.status}
                      onValueChange={(value: string) => {
                        if (
                          Object.values(CardOrderStatus).includes(
                            value as CardOrderStatus,
                          )
                        ) {
                          updateFilters({ status: value as CardOrderStatus })
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={CardOrderStatus.ALL}>
                          {t('profile.cardOrder.status.all')}
                        </SelectItem>
                        <SelectItem value={CardOrderStatus.PENDING}>
                          {t('profile.cardOrder.status.pending')}
                        </SelectItem>
                        <SelectItem value={CardOrderStatus.COMPLETED}>
                          {t('profile.cardOrder.status.completed')}
                        </SelectItem>
                        <SelectItem value={CardOrderStatus.FAILED}>
                          {t('profile.cardOrder.status.failed')}
                        </SelectItem>
                        <SelectItem value={CardOrderStatus.CANCELLED}>
                          {t('profile.cardOrder.status.cancelled')}
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
                    {t('profile.common.clearFilters')}
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
          ) : isError ? (
            // Error state
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-4 rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                <Package className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="mb-2 text-lg font-medium">
                {t('profile.cardOrder.loadError')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('profile.common.error')}
              </p>
              <button
                className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90"
                onClick={() => refetch()}
              >
                {t('profile.tryAgain')}
              </button>
            </div>
          ) : cardOrders.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-4 rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-medium">
                {t('profile.cardOrder.noOrders')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('profile.cardOrder.noOrdersDescription')}
              </p>
            </div>
          ) : (
            // Card order items
            <div className="space-y-1">
              {cardOrders.map((cardOrder, index) => (
                <div
                  key={cardOrder.slug}
                  ref={index === cardOrders.length - 5 ? lastElementRef : null}
                >
                  <CardOrderItem cardOrder={cardOrder} />
                </div>
              ))}

              {/* Loading more indicator */}
              {isFetchingNextPage && (
                <div className="py-2">
                  <TransactionCardSkeleton />
                </div>
              )}

              {/* End of list message */}
              {!hasNextPage && cardOrders.length > 0 && (
                <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  {t('profile.common.noMoreResults')}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sheet for Card Order Details */}
      <GiftCardOrderDetailsSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        cardOrder={selectedCardOrder}
      />
    </div>
  )
}
