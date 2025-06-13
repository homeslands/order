import { useTranslation } from 'react-i18next'
import moment from 'moment'
import { ICardOrderResponse } from '@/types'

interface CustomerInfoProps {
  orderData: ICardOrderResponse
}

export default function CustomerInfo({ orderData }: CustomerInfoProps) {
  const { t } = useTranslation(['giftCard'])

  return (
    <div className="rounded border bg-gray-50">
      <div className="bg-gray-300 px-3 py-2 font-semibold">
        {t('giftCard.customerInfo')}
      </div>
      <div className="space-y-1 p-3 text-sm">
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
