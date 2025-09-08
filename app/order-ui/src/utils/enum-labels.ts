import i18next from 'i18next'
import {
  CardOrderStatus,
  GiftCardType,
  GiftCardUsageStatus,
  PaymentMethod,
  paymentStatus,
} from '@/constants'

export const getGiftCardOrderStatusLabel = (status: string): string => {
  const statusLower = status?.toLowerCase() || ''

  switch (statusLower) {
    case CardOrderStatus.PENDING:
      return i18next.t('giftCard.statusPending', { ns: 'giftCard' })
    case CardOrderStatus.COMPLETED:
      return i18next.t('giftCard.statusCompleted', { ns: 'giftCard' })
    case CardOrderStatus.FAILED:
      return i18next.t('giftCard.statusFailed', { ns: 'giftCard' })
    case CardOrderStatus.CANCELLED:
      return i18next.t('giftCard.statusCancelled', { ns: 'giftCard' })
    default:
      return status
  }
}

export const getPaymentStatusLabel = (status: string): string => {
  switch (status) {
    case paymentStatus.PENDING:
      return i18next.t('paymentMethod.pending', { ns: 'menu' })
    case paymentStatus.COMPLETED:
      return i18next.t('paymentMethod.paid', { ns: 'menu' })
    case paymentStatus.CANCELLED:
      return i18next.t('paymentMethod.cancelled', { ns: 'menu' })
    default:
      return status
  }
}

export const getPaymentMethodLabel = (method: string): string => {
  switch (method) {
    case PaymentMethod.BANK_TRANSFER:
      return i18next.t('paymentMethod.bankTransfer', { ns: 'menu' })
    case PaymentMethod.CASH:
      return i18next.t('paymentMethod.cash', { ns: 'menu' })
    case PaymentMethod.POINT:
      return i18next.t('paymentMethod.point', { ns: 'menu' })
    default:
      return i18next.t('paymentMethod.unpaid', { ns: 'menu' })
  }
}

export const getGiftCardTypeLabel = (type: string): string => {
  switch (type) {
    case GiftCardType.SELF:
      return i18next.t('giftCard.buyForSelf', { ns: 'giftCard' })
    case GiftCardType.GIFT:
      return i18next.t('giftCard.giftToOthers', { ns: 'giftCard' })
    case GiftCardType.BUY:
      return i18next.t('giftCard.purchaseGiftCard', { ns: 'giftCard' })
    case GiftCardType.NONE:
      return i18next.t('giftCard.giftCardLock', { ns: 'giftCard' })
    default:
      return type
  }
}

export const getGiftCardUsageStatusLabel = (status: string): string => {
  switch (status) {
    case GiftCardUsageStatus.AVAILABLE:
      return i18next.t('profile.giftCard.status.available', { ns: 'profile' })
    case GiftCardUsageStatus.USED:
      return i18next.t('profile.giftCard.status.used', { ns: 'profile' })
    case GiftCardUsageStatus.EXPIRED:
      return i18next.t('profile.giftCard.status.expired', { ns: 'profile' })
    case GiftCardUsageStatus.ALL:
      return i18next.t('profile.giftCard.status.all', { ns: 'profile' })
    default:
      return status
  }
}
