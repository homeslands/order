import { useTranslation } from 'react-i18next'
import { CoinsIcon } from 'lucide-react'
import { ICardOrderResponse } from '@/types'
import { formatCurrency } from '@/utils'

interface GiftCardDetailsTableProps {
  orderData: ICardOrderResponse
}

export default function GiftCardDetailsTable({
  orderData,
}: GiftCardDetailsTableProps) {
  const { t } = useTranslation(['giftCard'])
  return (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full border border-gray-300 bg-white text-sm dark:border-gray-600 dark:bg-gray-800">
        {/* Table header */}
        <thead className="bg-gray-200 dark:bg-gray-700">
          <tr>
            <th className="border border-gray-300 px-2 py-1 text-gray-900 dark:border-gray-600 dark:text-white">
              {t('giftCard.giftCard')}
            </th>
            <th className="border border-gray-300 px-2 py-1 text-gray-900 dark:border-gray-600 dark:text-white">
              {t('giftCard.points')}
            </th>
            <th className="border border-gray-300 px-2 py-1 text-gray-900 dark:border-gray-600 dark:text-white">
              {t('giftCard.price')}
            </th>
            <th className="border border-gray-300 px-2 py-1 text-gray-900 dark:border-gray-600 dark:text-white">
              {t('giftCard.quantity')}
            </th>
            <th className="border border-gray-300 px-2 py-1 text-gray-900 dark:border-gray-600 dark:text-white">
              {t('giftCard.total')}
            </th>
          </tr>
        </thead>
        {/* Table body with gift card order details */}
        <tbody>
          <tr className="text-gray-700 dark:text-gray-300">
            <td className="border border-gray-300 px-2 py-1 text-center dark:border-gray-600">
              {orderData.cardTitle}
            </td>
            <td className="border border-gray-300 px-2 py-1 text-center dark:border-gray-600">
              <CoinsIcon className="inline h-4 w-4 text-primary" />{' '}
              {formatCurrency(orderData.cardPoint, '')}
            </td>
            <td className="border border-gray-300 px-2 py-1 text-center dark:border-gray-600">
              {formatCurrency(orderData.cardPrice)}
            </td>
            <td className="border border-gray-300 px-2 py-1 text-center dark:border-gray-600">
              x{orderData.quantity}
            </td>
            <td className="border border-gray-300 px-2 py-1 text-center dark:border-gray-600">
              {formatCurrency(orderData.totalAmount)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
