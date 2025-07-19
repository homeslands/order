import { useTranslation } from 'react-i18next'
import moment from 'moment'
import { ICardOrderResponse, OrderStatus } from '@/types'
import { GiftCardType } from '@/constants'

interface OrderInfoProps {
  orderData: ICardOrderResponse
}

export default function OrderInfo({ orderData }: OrderInfoProps) {
  const { t } = useTranslation(['giftCard', 'menu'])
  // Helper function to translate order and payment statuses
  const getStatusTranslation = (status: string): string => {
    // Convert status to lowercase for case-insensitive matching
    const statusLower = status?.toLowerCase() || ''

    switch (statusLower) {
      case OrderStatus.PENDING:
        return t('giftCard.statusPending')
      case OrderStatus.COMPLETED:
        return t('giftCard.statusCompleted')
      case OrderStatus.FAILED:
        return t('giftCard.statusFailed')
      default:
        return status // Return original if no translation found
    }
  }
  return (
    <div className="rounded border bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
      <div className="bg-gray-300 px-3 py-2 font-semibold text-gray-900 dark:bg-gray-700 dark:text-white">
        {t('giftCard.orderInfo')}
      </div>
      <div className="space-y-1 p-3 text-sm text-gray-700 dark:text-gray-300">
        {/* Order ID */}
        <div className="flex justify-between">
          <span>{t('giftCard.orderId')}</span>
          <span>{orderData.slug}</span>
        </div>
        {/* Order type */}
        <div className="flex justify-between">
          <span>{t('giftCard.orderType')}</span>
          <span>
            {orderData.type == GiftCardType.SELF
              ? t('giftCard.buyForSelf')
              : t('giftCard.giftToOthers')}
          </span>
        </div>
        {/* Order status */}{' '}
        <div className="flex justify-between">
          <span>{t('giftCard.status')}</span>
          <span>{getStatusTranslation(orderData.status)}</span>
        </div>
        {/* Payment status with fallback to 'Pending' */}
        <div className="flex justify-between">
          <span>{t('giftCard.paymentStatus')}</span>
          <span>{getStatusTranslation(orderData.paymentStatus)}</span>
        </div>
        {/* Payment expiration date (15 minutes after order date) */}
        <div className="flex justify-between">
          <span>{t('giftCard.paymentExpireDate')}</span>
          <span>
            {moment(orderData.orderDate)
              .add(15, 'minutes')
              .format('HH:mm:ss DD/MM/YYYY')}
          </span>
        </div>
      </div>
    </div>
  )
}
