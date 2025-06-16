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
      <table className="w-full border text-sm">
        {/* Table header */}
        <thead className="bg-gray-200">
          <tr>
            <th className="border px-2 py-1">{t('giftCard.giftCard')}</th>
            <th className="border px-2 py-1">{t('giftCard.points')}</th>
            <th className="border px-2 py-1">{t('giftCard.price')}</th>
            <th className="border px-2 py-1">{t('giftCard.quantity')}</th>
            <th className="border px-2 py-1">{t('giftCard.total')}</th>
          </tr>
        </thead>
        {/* Table body with gift card order details */}
        <tbody>
          <tr>
            <td className="border px-2 py-1 text-center">
              {orderData.cardTitle}
            </td>
            <td className="border px-2 py-1 text-center">
              <CoinsIcon className="inline h-4 w-4 text-primary" />{' '}
              {formatCurrency(orderData.cardPoint, '')}
            </td>
            <td className="border px-2 py-1 text-center">
              {formatCurrency(orderData.cardPrice)}
            </td>
            <td className="border px-2 py-1 text-center">
              x{orderData.quantity}
            </td>
            <td className="border px-2 py-1 text-center">
              {formatCurrency(orderData.totalAmount)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
