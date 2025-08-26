import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Gift,
  ShoppingBag,
  Clock,
  Tag,
  User,
  Sparkles,
  Star,
  CoinsIcon,
  ExternalLink,
  XCircle,
  Loader2,
} from 'lucide-react'
import { IPointTransaction } from '@/types'
import {
  GiftCardType,
  PointTransactionObjectType,
  PointTransactionType,
  publicFileURL,
} from '@/constants'
import { formatCurrency } from '@/utils'
import { ROUTE } from '@/constants'
import moment from 'moment'
import { useIsMobile } from '@/hooks'
import { useGetCardOrder, useGetGiftCardBySlug } from '@/hooks/use-gift-card'
import { Separator } from '@/components/ui/separator'
import { Tooltip } from 'react-tooltip'
import { useUserStore } from '@/stores'

interface TransactionGiftCardDetailDialogProps {
  transaction: IPointTransaction
  children: React.ReactNode
}

export default function TransactionGiftCardDetailDialog({
  transaction,
  children,
}: TransactionGiftCardDetailDialogProps) {
  const { t } = useTranslation(['profile'])
  const { t: tGiftCard } = useTranslation(['giftCard'])

  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useIsMobile()
  const { userInfo } = useUserStore()

  const isAdd = transaction.type === PointTransactionType.IN
  const isGiftCard =
    transaction.objectType === PointTransactionObjectType.GIFT_CARD
  const isGiftCardOrder =
    transaction.objectType === PointTransactionObjectType.CARD_ORDER
  const isOrder = transaction.objectType === PointTransactionObjectType.ORDER

  const {
    data: giftCardResponse,
    isLoading: isLoadingGiftCard,
    error: giftCardError,
  } = useGetGiftCardBySlug(transaction.objectSlug, isOpen && isGiftCard)

  const {
    data: cardOrderResponse,
    isLoading: isLoadingCardOrder,
    error: cardOrderError,
  } = useGetCardOrder(transaction.objectSlug, isOpen && isGiftCardOrder)

  const isLoading = isLoadingGiftCard || isLoadingCardOrder
  const error =
    giftCardError || cardOrderError ? t('profile.errorFetchingGiftCard') : null
  const giftCardDetails = giftCardResponse?.result || null
  const giftCardOrderDetails = cardOrderResponse?.result || null

  const getTransactionIcon = () => {
    if (isGiftCard) {
      return <Gift size={24} className="text-white" />
    } else if (isOrder) {
      return <ShoppingBag size={24} className="text-white" />
    }
    return null
  }

  const getTransactionTypeText = () => {
    if (transaction.objectType === PointTransactionObjectType.GIFT_CARD) {
      return t('profile.useGiftCard')
    } else if (
      transaction.objectType === PointTransactionObjectType.CARD_ORDER
    ) {
      return t('profile.giftCardTransaction')
    } else if (transaction.objectType === PointTransactionObjectType.ORDER) {
      return t('profile.paymentForOrder')
    }
    return t('profile.transaction')
  }

  const getAmountColor = () => {
    return isAdd
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400'
  }

  // Sparkle animation component for gift card
  const SparkleEffect = () => (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className={`absolute animate-pulse ${
            i % 2 === 0 ? 'animate-bounce' : 'animate-ping'
          }`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        >
          <Sparkles
            size={12 + Math.random() * 8}
            className="text-yellow-400 opacity-70"
          />
        </div>
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={`star-${i}`}
          className="animate-twinkle absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${1.5 + Math.random() * 1.5}s`,
          }}
        >
          <Star
            size={8 + Math.random() * 6}
            className="fill-current text-purple-400 opacity-60"
          />
        </div>
      ))}
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className={`${isMobile ? 'max-w-[90%] rounded-md' : 'max-w-md'} ${
          isGiftCard
            ? 'from-purple-1 bg-gradient-to-br via-white to-pink-100 dark:from-purple-950 dark:via-gray-900 dark:to-pink-950'
            : 'bg-white dark:bg-gray-900'
        }`}
      >
        {/* Sparkle effect for gift card */}
        {(isGiftCard || isGiftCardOrder) && <SparkleEffect />}

        <div className="relative z-10">
          <DialogHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <div
                className={`rounded-full p-4 ${
                  isGiftCard || isGiftCardOrder
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg'
                    : isOrder
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg'
                      : 'bg-gray-500 shadow-lg'
                }`}
              >
                {getTransactionIcon()}
              </div>
            </div>
            <DialogTitle
              className={`text-xl font-bold ${
                isGiftCard || isGiftCardOrder
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'
                  : isOrder
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-800 dark:text-gray-200'
              }`}
            >
              {t('profile.transactionDetails')}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-6">
            <div className="custom-scrollbar max-h-[60vh] space-y-6 overflow-y-auto">
              {/* Amount Section */}
              <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-800">
                <div className={`text-3xl font-bold ${getAmountColor()}`}>
                  {isAdd ? '+ ' : '- '}
                  {formatCurrency(transaction.points, '')}{' '}
                  <CoinsIcon className="inline-block h-6 w-6 text-primary" />
                </div>
              </div>

              {/* Transaction Details */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Tag size={16} className="mt-1 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('profile.transactionType')}
                    </p>
                    <p className="break-all font-mono text-sm font-medium">
                      {getTransactionTypeText()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock size={16} className="mt-1 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('profile.date')}
                    </p>
                    <p className="text-sm font-medium">
                      {moment(transaction.createdAt).format(
                        'HH:mm:ss DD/MM/YYYY',
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <User size={16} className="mt-1 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('profile.description')}
                    </p>
                    <p className="custom-scrollbar max-h-24 overflow-y-auto break-words text-sm font-medium">
                      {transaction.desc}
                    </p>
                  </div>
                </div>

                {/* Gift Card Additional Information */}
                {(isGiftCard || isGiftCardOrder) && (
                  <>
                    <Separator className="my-4" />

                    {isLoading && (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin text-purple-500" />
                        <span>{t('profile.loadingGiftCardDetails')}</span>
                      </div>
                    )}

                    {error && (
                      <div className="rounded-md bg-red-50 p-3 text-center text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        <XCircle className="mx-auto mb-1 h-5 w-5" />
                        {error}
                      </div>
                    )}

                    {giftCardDetails && (
                      <div className="rounded-md bg-purple-50 p-4 dark:bg-purple-900/20">
                        <div className="custom-scrollbar max-h-[60vh] space-y-3 text-sm">
                          {/* Card Image */}
                          {giftCardDetails.cardOrder.cardImage ? (
                            <img
                              src={`${publicFileURL}/${giftCardDetails.cardOrder.cardImage}`}
                              alt={giftCardDetails.cardName}
                              className={`${isMobile ? 'h-max w-full rounded-md bg-gray-300 object-contain' : 'h-full w-full object-cover'}`}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40">
                              <Gift
                                className={`text-primary ${isMobile ? 'h-8 w-8' : 'h-16 w-16'}`}
                              />
                            </div>
                          )}
                          {/* Card Name */}
                          <div className="flex items-start justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              {t('profile.giftCardName')}
                            </span>
                            <span
                              className={`${isMobile ? 'max-w-[120px]' : 'max-w-[300px]'} truncate font-medium text-gray-900 dark:text-gray-100`}
                              data-tooltip-id="cardName-tooltip"
                              data-tooltip-content={String(
                                giftCardDetails.cardName,
                              )}
                            >
                              {giftCardDetails.cardName}
                            </span>
                            <Tooltip
                              id="cardName-tooltip"
                              variant="light"
                              style={{ width: '30rem' }}
                            />
                          </div>
                          {/* Serial */}
                          {transaction.objectType ===
                            PointTransactionObjectType.GIFT_CARD && (
                            <div className="flex items-start justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                {t('profile.serial')}
                              </span>
                              <span
                                className={`truncate font-medium text-gray-900 dark:text-gray-100`}
                              >
                                {giftCardDetails.serial}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {giftCardOrderDetails && (
                      <div className="rounded-md bg-purple-50 p-4 dark:bg-purple-900/20">
                        <div className="custom-scrollbar max-h-[60vh] space-y-3 text-sm">
                          {/* Card Image */}
                          {giftCardOrderDetails.cardImage ? (
                            <img
                              src={`${publicFileURL}/${giftCardOrderDetails.cardImage}`}
                              alt={giftCardOrderDetails.cardTitle}
                              className={`${isMobile ? 'h-max w-full rounded-md bg-gray-300 object-contain' : 'h-full w-full object-cover'}`}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40">
                              <Gift
                                className={`text-primary ${isMobile ? 'h-8 w-8' : 'h-16 w-16'}`}
                              />
                            </div>
                          )}
                          {/* Card Name */}
                          <div className="flex items-start justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              {t('profile.giftCardName')}
                            </span>
                            <span
                              className={`${isMobile ? 'max-w-[120px]' : 'max-w-[300px]'} truncate font-medium text-gray-900 dark:text-gray-100`}
                              data-tooltip-id="cardName-tooltip"
                              data-tooltip-content={String(
                                giftCardOrderDetails.cardTitle,
                              )}
                            >
                              {giftCardOrderDetails.cardTitle}
                            </span>
                            <Tooltip
                              id="cardName-tooltip"
                              variant="light"
                              style={{ width: '30rem' }}
                            />
                          </div>

                          {/* Order Type */}
                          <div className="flex items-start justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              {t('profile.orderType')}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {giftCardOrderDetails.type === GiftCardType.SELF
                                ? tGiftCard('giftCard.buyForSelf')
                                : giftCardOrderDetails.type ===
                                    GiftCardType.GIFT
                                  ? tGiftCard('giftCard.giftToOthers')
                                  : giftCardOrderDetails.type ===
                                      GiftCardType.BUY
                                    ? tGiftCard('giftCard.purchaseGiftCard')
                                    : giftCardOrderDetails.type}
                            </span>
                          </div>
                          {/* Customer Name */}
                          {giftCardOrderDetails.type === GiftCardType.GIFT && (
                            <div className="flex items-start justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                {tGiftCard('giftCard.giverName')}
                              </span>
                              <span
                                className={`${isMobile ? 'max-w-[120px]' : 'max-w-[300px]'} truncate font-medium text-gray-900 dark:text-gray-100`}
                              >
                                {giftCardOrderDetails.customerName}
                              </span>
                            </div>
                          )}
                          {/* Quantity */}
                          <div className="flex items-start justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              {tGiftCard('giftCard.quantity')}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {giftCardOrderDetails.type === GiftCardType.GIFT
                                ? giftCardOrderDetails.receipients.find(
                                    (receipient) =>
                                      receipient.recipientSlug ===
                                      userInfo?.slug,
                                  )?.quantity
                                : giftCardOrderDetails.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center gap-3 pt-4">
              {/* View Order Detail Button - only show for order transactions */}
              {isOrder && (
                <NavLink
                  to={`${ROUTE.CLIENT_ORDER_HISTORY}?order=${transaction.objectSlug}`}
                >
                  <Button
                    variant="outline"
                    className="border-blue-500 px-6 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {t('profile.viewOrderDetail')}
                  </Button>
                </NavLink>
              )}

              <Button
                onClick={() => setIsOpen(false)}
                className={`px-8 ${
                  isGiftCard || isGiftCardOrder
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                    : isOrder
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                      : ''
                }`}
              >
                {t('profile.close')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
