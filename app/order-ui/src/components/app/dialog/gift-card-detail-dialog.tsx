import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  Gift,
  Clock,
  Calendar,
  Star,
  Sparkles,
  CoinsIcon,
  User,
  Hash,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  QrCode,
  Copy,
  Check,
  CalendarX,
} from 'lucide-react'
import { IGiftCardDetail } from '@/types/gift-card.type'
import { GiftCardUsageStatus, publicFileURL } from '@/constants'
import { formatCurrency } from '@/utils'
import moment from 'moment'
import { useIsMobile } from '@/hooks'
import { GiftCardStatusBadge } from '../badge'

interface GiftCardDetailDialogProps {
  giftCard: IGiftCardDetail
  children: React.ReactNode
}

export default function GiftCardDetailDialog({
  giftCard,
  children,
}: GiftCardDetailDialogProps) {
  const { t } = useTranslation(['profile'])
  const [isOpen, setIsOpen] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const isMobile = useIsMobile()

  // Copy to clipboard function
  const copyToClipboard = async (text: string, fieldName: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
  }

  // Get status info
  const getStatusInfo = (status: string) => {
    switch (status) {
      case GiftCardUsageStatus.AVAILABLE:
        return {
          icon: <CheckCircle size={20} className="text-green-600" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          label: t('profile.giftCard.status.available'),
        }
      case GiftCardUsageStatus.USED:
        return {
          icon: <CheckCircle size={20} className="text-green-600" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          label: t('profile.giftCard.status.used'),
        }
      case GiftCardUsageStatus.EXPIRED:
        return {
          icon: <AlertCircle size={20} className="text-red-600" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          label: t('profile.giftCard.status.expired'),
        }
      default:
        return {
          icon: <Gift size={20} className="text-blue-600" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          label: status,
        }
    }
  }

  const statusInfo = getStatusInfo(
    giftCard.status || GiftCardUsageStatus.AVAILABLE,
  )
  const isAvailable = giftCard.status === GiftCardUsageStatus.AVAILABLE

  // Sparkle animation component
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
          isAvailable
            ? 'bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-purple-950 dark:via-gray-900 dark:to-pink-950'
            : 'bg-white dark:bg-gray-900'
        }`}
      >
        {/* Sparkle effect for available gift cards */}
        {isAvailable && <SparkleEffect />}

        <div className="relative z-10">
          <DialogHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <div
                className={`rounded-full p-4 ${
                  isAvailable
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg'
                    : statusInfo.bgColor +
                      ' ' +
                      statusInfo.borderColor +
                      ' border'
                }`}
              >
                {isAvailable ? (
                  <Gift size={24} className="text-white" />
                ) : (
                  statusInfo.icon
                )}
              </div>
            </div>

            <DialogTitle className="text-xl font-bold">
              {giftCard.cardName || t('profile.giftCard.defaultTitle')}
            </DialogTitle>

            {/* Status Badge */}
            <div className="flex justify-center">
              <GiftCardStatusBadge
                status={giftCard.status || GiftCardUsageStatus.AVAILABLE}
                rounded="md"
              />
            </div>
          </DialogHeader>

          <div className="mt-6 space-y-4">
            <div className="custom-scrollbar max-h-[60vh] space-y-6 overflow-y-auto">
              {/* Card Image */}
              {giftCard.cardOrder.cardImage ? (
                <img
                  src={`${publicFileURL}/${giftCard.cardOrder.cardImage}`}
                  alt={giftCard.cardName}
                  className={`${isMobile ? 'h-max w-full rounded-md bg-gray-300 object-contain' : 'h-full w-full object-cover'}`}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40">
                  <Gift
                    className={`text-primary ${isMobile ? 'h-8 w-8' : 'h-16 w-16'}`}
                  />
                </div>
              )}
              {/* Gift Card Value */}
              {giftCard.cardPoints && (
                <div className="rounded-lg bg-gradient-to-r from-orange-50 to-yellow-50 p-4 dark:from-orange-950/30 dark:to-yellow-950/30">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-2xl font-bold text-orange-600">
                      {formatCurrency(giftCard.cardPoints, '')}
                    </span>
                    <CoinsIcon className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              )}

              <Separator />

              {/* Gift Card Details */}
              <div className="space-y-3">
                {/* Serial Number */}
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Hash
                      size={18}
                      className="text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('profile.giftCard.serial')}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="rounded bg-gray-100 px-2 py-1 font-mono text-sm font-medium dark:bg-gray-800">
                        {giftCard.serial}
                      </p>
                      <button
                        onClick={() =>
                          copyToClipboard(giftCard.serial, 'serial')
                        }
                        className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                        title={t('profile.common.copy')}
                      >
                        {copiedField === 'serial' ? (
                          <Check size={14} className="text-green-500" />
                        ) : (
                          <Copy
                            size={14}
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Gift Card Code */}
                {giftCard.code && (
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <QrCode
                        size={18}
                        className="text-purple-600 dark:text-purple-400"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('profile.giftCard.code')}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="rounded bg-gray-100 px-2 py-1 font-mono text-sm font-medium dark:bg-gray-800">
                          {giftCard.code}
                        </p>
                        <button
                          onClick={() => copyToClipboard(giftCard.code, 'code')}
                          className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                          title={t('profile.common.copy')}
                        >
                          {copiedField === 'code' ? (
                            <Check size={14} className="text-green-500" />
                          ) : (
                            <Copy
                              size={14}
                              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Created Date */}
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                    <Calendar
                      size={18}
                      className="text-green-600 dark:text-green-400"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('profile.giftCard.createdAt')}
                    </p>
                    <p className="text-sm font-medium">
                      {moment(giftCard.createdAt).format('HH:mm DD/MM/YYYY')}
                    </p>
                  </div>
                </div>

                {/* Used Date (if used) */}
                {giftCard.usedAt && (
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-900/30">
                      <Clock
                        size={18}
                        className="text-gray-600 dark:text-gray-400"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('profile.giftCard.usedAt')}
                      </p>
                      <p className="text-sm font-medium">
                        {moment(giftCard.usedAt).format('HH:mm DD/MM/YYYY')}
                      </p>
                    </div>
                  </div>
                )}
                {/* Expired Date */}
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                    <CalendarX
                      size={18}
                      className="text-red-600 dark:text-red-400"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('profile.giftCard.expiredAt')}
                    </p>
                    <p className="text-sm font-medium">
                      {moment(giftCard.expiredAt).format('HH:mm DD/MM/YYYY')}
                    </p>
                  </div>
                </div>

                {/* Used By User (if used) */}
                {giftCard.status === GiftCardUsageStatus.USED &&
                  giftCard.usedBy && (
                    <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-900/20">
                      <div className="flex items-start space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                          <User
                            size={18}
                            className="text-orange-600 dark:text-orange-400"
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                            {t('profile.giftCard.usedBy')}
                          </p>
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {giftCard.usedBy.firstName}{' '}
                              {giftCard.usedBy.lastName}
                            </p>
                            {giftCard.usedBy.email && (
                              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                <Mail size={12} className="text-blue-500" />
                                <span>{giftCard.usedBy.email}</span>
                              </div>
                            )}
                            {giftCard.usedBy.phonenumber && (
                              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                <Phone size={12} className="text-green-500" />
                                <span>{giftCard.usedBy.phonenumber}</span>
                              </div>
                            )}
                            {giftCard.usedBy.address && (
                              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                <MapPin size={12} className="text-red-500" />
                                <span>{giftCard.usedBy.address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
              </div>

              {/* Additional Info */}
              {giftCard.status === GiftCardUsageStatus.EXPIRED && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                  <div className="flex items-center space-x-2">
                    <AlertCircle size={16} className="text-red-600" />
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {t('profile.giftCard.expiredMessage')}
                    </p>
                  </div>
                </div>
              )}

              {giftCard.status === GiftCardUsageStatus.USED && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/20">
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={16} className="text-gray-600" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('profile.giftCard.usedMessage')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
