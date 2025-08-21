import { useTranslation } from 'react-i18next'
import { ICardOrderResponse } from '@/types'

interface CashierInfoProps {
  orderData: ICardOrderResponse
}

export default function CashierInfo({ orderData }: CashierInfoProps) {
  const { t } = useTranslation(['giftCard'])
  return (
    <div className="rounded border bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
      <div className="bg-gray-300 px-3 py-2 font-semibold text-gray-900 dark:bg-gray-700 dark:text-white">
        {t('giftCard.cashierInfo.title')}
      </div>
      <div className="space-y-1 p-3 text-sm text-gray-700 dark:text-gray-300">
        {/* Cashier name display */}
        <div className="flex justify-between">
          <span>{t('giftCard.cashierInfo.cashierName')}</span>
          <span>
            {orderData.cashierName && orderData.cashierName !== 'null null'
              ? orderData.cashierName
              : t('giftCard.noName')}
          </span>
        </div>
        {/* Cashier phone display */}
        <div className="flex justify-between">
          <span>{t('giftCard.cashierInfo.cashierPhone')}</span>
          <span>{orderData.cashierPhone}</span>
        </div>
      </div>
    </div>
  )
}
