import { useTranslation } from 'react-i18next'
import moment from 'moment'
import { ICardOrderResponse } from '@/types'

interface CustomerInfoProps {
  orderData: ICardOrderResponse
}

export default function CustomerInfo({ orderData }: CustomerInfoProps) {
  const { t } = useTranslation(['giftCard'])
  return (
    <div className="rounded border bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
      <div className="bg-gray-300 px-3 py-2 font-semibold text-gray-900 dark:bg-gray-700 dark:text-white">
        {t('giftCard.customerInfo')}
      </div>
      <div className="space-y-1 p-3 text-sm text-gray-700 dark:text-gray-300">
        {/* Customer name display */}
        <div className="flex justify-between">
          <span>{t('giftCard.customerName')}</span>
          <span>
            {orderData.customerName && orderData.customerName !== 'null null'
              ? orderData.customerName
              : t('giftCard.noName')}
          </span>
        </div>
        {/* Customer phone display */}
        <div className="flex justify-between">
          <span>{t('giftCard.phone')}</span>
          <span>{orderData.customerPhone}</span>
        </div>
        {/* Order date with formatted timestamp */}
        <div className="flex justify-between">
          <span>{t('giftCard.orderDate')}</span>
          <span>
            {moment(orderData.orderDate).format('HH:mm:ss DD/MM/YYYY')}
          </span>
        </div>
      </div>
    </div>
  )
}
