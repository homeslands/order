import { useEffect, useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Gift, Clock, Filter, X, CoinsIcon, Copy, Check } from 'lucide-react'

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
import moment from 'moment'
import { TransactionCardSkeleton } from '@/components/app/skeleton/transaction-card-skeleton'
import { useGetUserGiftCardsInfinite } from '@/hooks/use-gift-card'
import { GiftCardDetailDialog } from '@/components/app/dialog'
import type { IGiftCardDetail } from '@/types/gift-card.type'
import { GiftCardUsageStatus } from '@/constants'
import { SimpleDatePicker } from '../picker'
import { GiftCardStatusBadge } from '@/components/app/badge'

export function CustomerGiftCardTabsContent() {
  const { t } = useTranslation(['profile'])

  const [isFilterOpen, setIsFilterOpen] = useState(true)
  const isMobile = useIsMobile()
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastElementRef = useRef<HTMLDivElement | null>(null)

  const {
    giftCards,
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
  } = useGetUserGiftCardsInfinite({ pageSize: 10 })

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

  const GiftCardItem = ({ giftCard }: { giftCard: IGiftCardDetail }) => {
    const [copiedCode, setCopiedCode] = useState<string | null>(null)

    const handleCopyCode = useCallback(
      async (e: React.MouseEvent, code: string, serial: string) => {
        e.stopPropagation()
        const formatted = `serial: ${serial}\ncode: ${code}`
        await navigator.clipboard.writeText(formatted)
        setCopiedCode(code)
        setTimeout(() => setCopiedCode(null), 2000)
      },
      [],
    )

    return (
      <GiftCardDetailDialog giftCard={giftCard}>
        <div
          className={`mb-3 cursor-pointer rounded-md border-l-4 border-l-green-500 bg-green-50 px-2 py-3 shadow-sm transition-shadow duration-200 hover:shadow-md dark:bg-green-900/30`}
        >
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="flex items-center gap-4">
                  <div className={`rounded-lg ${isMobile ? 'p-1' : 'p-2'} `}>
                    <Gift
                      className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-primary`}
                    />
                  </div>
                  {!isMobile && (
                    <p className={`text-smfont-medium`}>
                      {giftCard.cardName || t('profile.giftCard.defaultTitle')}
                    </p>
                  )}
                  <GiftCardStatusBadge
                    status={giftCard.status || GiftCardUsageStatus.AVAILABLE}
                    rounded="md"
                  />
                </div>
                <span
                  className={`${isMobile ? 'text-xs' : 'text-sm'} flex items-center gap-1 text-muted-foreground`}
                >
                  <Clock className="h-3 w-3" />
                  {moment(giftCard.createdAt).format('HH:mm:ss DD/MM/YYYY')}
                </span>
              </div>

              {isMobile && (
                <p className={`mb-1 pt-1 text-xs font-medium`}>
                  {giftCard.cardName || t('profile.giftCard.defaultTitle')}
                </p>
              )}

              {giftCard.cardPoints && (
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  {t('profile.giftCard.pointsReceived')}:
                  <span className="text-primary">
                    {giftCard.cardPoints}{' '}
                    <CoinsIcon className="inline h-4 w-4 text-primary" />
                  </span>
                </div>
              )}

              {giftCard.usedAt &&
                giftCard.status === GiftCardUsageStatus.USED && (
                  <div className={`mt-2 gap-1 text-sm text-muted-foreground`}>
                    <span>
                      {t('profile.giftCard.usedAt')}:{' '}
                      {moment(giftCard.usedAt).format('HH:mm:ss DD/MM/YYYY')}
                    </span>
                  </div>
                )}

              {giftCard.expiredAt && (
                <div className={`mt-2 gap-1 text-sm text-muted-foreground`}>
                  <span>
                    {t('profile.giftCard.expiredAt')}:{' '}
                    {moment(giftCard.expiredAt).format('HH:mm:ss DD/MM/YYYY')}
                  </span>
                </div>
              )}
              {giftCard.code && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {t('profile.giftCard.copyCode')}:
                  </span>
                  <div className="flex items-center gap-2 rounded text-primary">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-6 w-6 p-0 transition-colors ${
                        copiedCode === giftCard.code
                          ? 'text-green-600 hover:text-green-700'
                          : 'text-primary hover:text-primary/80'
                      }`}
                      onClick={(e) =>
                        handleCopyCode(e, giftCard.code, giftCard.serial)
                      }
                    >
                      {copiedCode === giftCard.code ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </GiftCardDetailDialog>
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
              <span className="rounded-full bg-blue-100 p-1 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                <Gift size={isMobile ? 16 : 18} />
              </span>
              {t('profile.giftCard.transactions')}
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
              {/* Filter Toggle Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`${hasActiveFilters ? 'border-primary text-primary' : ''} ${isMobile ? 'min-w-[100px]' : 'min-w-[120px]'}`}
              >
                <Filter size={16} className="mr-2" />
                {t('profile.common.filter')}
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

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {t('profile.giftCard.status.label')}
                    </Label>
                    <Select
                      value={filters.status}
                      onValueChange={(value: string) => {
                        if (
                          Object.values(GiftCardUsageStatus).includes(
                            value as GiftCardUsageStatus,
                          )
                        ) {
                          updateFilters({
                            status: value as GiftCardUsageStatus,
                          })
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={GiftCardUsageStatus.ALL}>
                          {t('profile.giftCard.status.all')}
                        </SelectItem>
                        <SelectItem value={GiftCardUsageStatus.AVAILABLE}>
                          {t('profile.giftCard.status.available')}
                        </SelectItem>
                        <SelectItem value={GiftCardUsageStatus.USED}>
                          {t('profile.giftCard.status.used')}
                        </SelectItem>
                        <SelectItem value={GiftCardUsageStatus.EXPIRED}>
                          {t('profile.giftCard.status.expired')}
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
            <div className="space-y-1">
              {Array.from({ length: 3 }).map((_, index) => (
                <TransactionCardSkeleton key={`skeleton-${index}`} />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-4 rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                <Gift className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="mb-2 text-lg font-medium">
                {t('profile.common.error')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('profile.giftCard.loadError')}
              </p>
              <button
                className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90"
                onClick={() => refetch()}
              >
                {t('profile.common.tryAgain')}
              </button>
            </div>
          ) : giftCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-4 rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                <Gift className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-medium">
                {t('profile.giftCard.noGiftCards')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('profile.giftCard.noGiftCardsDescription')}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {giftCards.map((giftCard, index) => (
                <div
                  key={giftCard.slug}
                  ref={index === giftCards.length - 5 ? lastElementRef : null}
                >
                  <GiftCardItem giftCard={giftCard} />
                </div>
              ))}

              {/* Loading more indicator */}
              {isFetchingNextPage && (
                <div className="py-2">
                  <TransactionCardSkeleton />
                </div>
              )}

              {/* End of list message */}
              {!hasNextPage && giftCards.length > 0 && (
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
