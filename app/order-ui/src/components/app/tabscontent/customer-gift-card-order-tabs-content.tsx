import { useEffect, useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Package,
  Clock,
  Filter,
  X,
  CheckCircle,
  XCircle,
  Loader,
  ChevronDown,
  ChevronUp,
  User,
  Phone,
  MessageSquare,
  CreditCard,
  Calendar,
  Receipt,
  Gift,
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
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import {
  formatCurrency,
  getGiftCardTypeLabel,
  getGiftCardUsageStatusLabel,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from '@/utils'
import { useGetCardOrdersInfinite } from '@/hooks'
import { CardOrderStatus, GiftCardUsageStatus } from '@/constants'
import { ICardOrderResponse } from '@/types'
import moment from 'moment'
import { TransactionCardSkeleton } from '@/components/app/skeleton/transaction-card-skeleton'
import SimpleDatePicker from '@/components/app/picker/simple-date-picker'

export function CustomerGiftCardOrderTabsContent() {
  const { t } = useTranslation(['profile'])
  const isMobile = useIsMobile()

  const [isFilterOpen, setIsFilterOpen] = useState(true)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

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

  const toggleCardExpansion = useCallback((cardSlug: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(cardSlug)) {
        newSet.delete(cardSlug)
      } else {
        newSet.add(cardSlug)
      }
      return newSet
    })
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
    const isExpanded = expandedCards.has(cardOrder.slug)

    return (
      <div
        className={`mb-3 rounded-md border-l-4 px-2 py-3 shadow-sm transition-shadow duration-200 hover:shadow-md ${
          cardOrder.status === CardOrderStatus.COMPLETED
            ? 'border-l-green-500 bg-green-50 dark:bg-green-900/10'
            : cardOrder.status === CardOrderStatus.PENDING
              ? 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
              : cardOrder.status === CardOrderStatus.FAILED
                ? 'border-l-red-500 bg-red-50 dark:bg-red-900/10'
                : 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/10'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between gap-2">
              <div className="flex items-center gap-4">
                <div
                  className={`rounded-lg p-1 ${isMobile ? 'p-1' : 'p-2'} ${
                    cardOrder.status === CardOrderStatus.COMPLETED
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : cardOrder.status === CardOrderStatus.PENDING
                        ? 'bg-yellow-100 dark:bg-yellow-900/30'
                        : cardOrder.status === CardOrderStatus.FAILED
                          ? 'bg-red-100 dark:bg-red-900/30'
                          : 'bg-gray-100 dark:bg-gray-900/30'
                  }`}
                >
                  <Package
                    className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} ${statusBadge.color}`}
                  />
                </div>
                <Badge variant={statusBadge.variant} className="px-2 py-1">
                  <div className="flex items-center gap-1">
                    {statusBadge.icon}
                    {statusBadge.label}
                  </div>
                </Badge>
              </div>
              <span
                className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}
              >
                {t('profile.cardOrder.quantity')}: {cardOrder.quantity}
              </span>
            </div>

            <p
              className={`mb-1 ${isMobile ? 'text-xs' : 'text-sm'} font-medium`}
            >
              {cardOrder.cardTitle}
            </p>

            <div
              className={`${isMobile ? 'flex flex-col justify-end space-y-1 text-xs' : 'flex items-center gap-4 text-sm'} w-max`}
            >
              <span className="text-primary">
                {formatCurrency(cardOrder.cardPoint, '')}
                <CoinsIcon className="inline-block h-4 w-4 text-primary" />
              </span>

              <span className="font-medium text-primary">
                {t('profile.cardOrder.total')}:{' '}
                {formatCurrency(cardOrder.totalAmount)}
              </span>
            </div>
            <span
              className={`${isMobile ? 'text-xs' : 'text-sm'} mt-2 flex items-center justify-between text-muted-foreground`}
            >
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {moment(cardOrder.orderDate || cardOrder.createdAt).format(
                  'HH:mm:ss DD/MM/YYYY',
                )}
              </div>
              {/* Expand/Collapse Button */}
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCardExpansion(cardOrder.slug)}
                  className="h-8 px-2 text-xs"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-3 w-3" />
                      {t('profile.common.collapse')}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3" />
                      {t('profile.common.viewDetails')}
                    </>
                  )}
                </Button>
              </div>
            </span>

            {/* Collapsible Details */}
            <Collapsible open={isExpanded}>
              <CollapsibleContent className="mt-3">
                <div className="rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Payment Information */}
                    <div className="space-y-3">
                      <h4 className="flex items-center gap-2 text-sm font-medium">
                        <CreditCard className="h-4 w-4 text-blue-500" />
                        {t('profile.cardOrder.paymentInfo')}
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {t('profile.cardOrder.paymentMethod')}:
                          </span>
                          <span className="text-right font-medium">
                            {getPaymentMethodLabel(cardOrder.paymentMethod)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {t('profile.cardOrder.paymentStatus')}:
                          </span>
                          <span className="font-medium">
                            {getPaymentStatusLabel(cardOrder.paymentStatus)}
                          </span>
                        </div>
                        {cardOrder.payment && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                {t('profile.cardOrder.transactionId')}:
                              </span>
                              <span className="text-xs font-medium">
                                {cardOrder.payment.transactionId}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                {t('profile.cardOrder.paymentDate')}:
                              </span>
                              <span className="font-medium">
                                <Calendar className="mr-1 inline h-3 w-3" />
                                {moment(cardOrder.payment.createdAt).format(
                                  'HH:mm:ss DD/MM/YYYY',
                                )}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Gift Card Information */}
                    <div className="space-y-3">
                      <h4 className="flex items-center gap-2 text-sm font-medium">
                        <Gift className="h-4 w-4 text-purple-500" />
                        {t('profile.cardOrder.giftCardInfo')}
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {t('profile.cardOrder.cardType')}:
                          </span>
                          <span className="font-medium">
                            {getGiftCardTypeLabel(cardOrder.type)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {t('profile.cardOrder.cardPrice')}:
                          </span>
                          <span className="font-medium">
                            {formatCurrency(cardOrder.cardPrice)}
                          </span>
                        </div>
                        {cardOrder.giftCards?.length > 0 && (
                          <div>
                            <span className="mb-1 block text-muted-foreground">
                              {t('profile.cardOrder.giftCardCodes')}:
                            </span>
                            <div className="space-y-1">
                              {cardOrder.giftCards.map((giftCard, index) => (
                                <div
                                  key={giftCard.slug || index}
                                  className="rounded bg-gray-100 p-2 dark:bg-gray-700"
                                >
                                  <div className="mb-1 flex items-center gap-2">
                                    <Receipt className="h-3 w-3 text-gray-500" />
                                    <span className="text-xs font-medium">
                                      {giftCard.cardName}
                                    </span>
                                  </div>
                                  <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">
                                        {t('profile.cardOrder.code')}:
                                      </span>
                                      <span className="font-mono">
                                        {giftCard.code}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">
                                        {t('profile.cardOrder.serial')}:
                                      </span>
                                      <span className="font-mono">
                                        {giftCard.serial}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">
                                        {t('profile.cardOrder.points')}:
                                      </span>
                                      <span className="font-medium">
                                        {formatCurrency(
                                          giftCard.cardPoints,
                                          '',
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">
                                        {t('profile.cardOrder.status.label')}:
                                      </span>
                                      <span
                                        className={`font-medium ${
                                          giftCard.status ===
                                          GiftCardUsageStatus.AVAILABLE
                                            ? 'text-green-600'
                                            : giftCard.status ===
                                                GiftCardUsageStatus.USED
                                              ? 'text-red-600'
                                              : 'text-gray-900'
                                        }`}
                                      >
                                        {getGiftCardUsageStatusLabel(
                                          giftCard.status,
                                        )}
                                      </span>
                                    </div>
                                    {giftCard.expiredAt && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          {t('profile.cardOrder.expires')}:
                                        </span>
                                        <span className="text-xs">
                                          {moment(giftCard.expiredAt).format(
                                            'HH:mm:ss DD/MM/YYYY',
                                          )}
                                        </span>
                                      </div>
                                    )}
                                    {giftCard.usedAt && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          {t('profile.cardOrder.used')}:
                                        </span>
                                        <span className="text-xs">
                                          {moment(giftCard.usedAt).format(
                                            'HH:mm:ss DD/MM/YYYY',
                                          )}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recipients Information */}
                  {cardOrder.receipients &&
                    cardOrder.receipients.length > 0 && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
                          <User className="h-4 w-4 text-green-500" />
                          {t('profile.cardOrder.recipients')} (
                          {cardOrder.receipients.length})
                        </h4>
                        <div className="space-y-3">
                          {cardOrder.receipients.map((recipient, index) => (
                            <div
                              key={recipient.slug || index}
                              className="rounded-lg border bg-gray-50 p-3 dark:bg-gray-700"
                            >
                              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-xs">
                                    <User className="h-3 w-3 text-gray-500" />
                                    <span className="font-medium">
                                      {recipient.name !== 'null null'
                                        ? recipient.name
                                        : t('profile.cardOrder.noName')}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Phone className="h-3 w-3" />
                                    <span>{recipient.phone}</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {t('profile.cardOrder.quantity')}:{' '}
                                    {recipient.quantity}
                                  </div>
                                </div>
                                {recipient.message && (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs">
                                      <MessageSquare className="h-3 w-3 text-gray-500" />
                                      <span className="font-medium">
                                        {t('profile.cardOrder.message')}:
                                      </span>
                                    </div>
                                    <p className="rounded bg-white p-2 text-xs text-muted-foreground dark:bg-gray-600">
                                      {recipient.message}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
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
    </div>
  )
}
