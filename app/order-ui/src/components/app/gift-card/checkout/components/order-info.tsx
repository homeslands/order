import { useTranslation } from 'react-i18next'
import moment from 'moment'
import { ICardOrderResponse } from '@/types'
import { GiftCardType } from '@/constants'
import { getGiftCardOrderStatusLabel } from '@/utils'

interface OrderInfoProps {
  orderData: ICardOrderResponse
}

export default function OrderInfo({ orderData }: OrderInfoProps) {
  const { t } = useTranslation(['giftCard', 'menu'])

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
          <span>{getGiftCardOrderStatusLabel(orderData.status)}</span>
        </div>
        {/* Payment status with fallback to 'Pending' */}
        <div className="flex justify-between">
          <span>{t('giftCard.paymentStatus')}</span>
          <span>{getGiftCardOrderStatusLabel(orderData.paymentStatus)}</span>
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
