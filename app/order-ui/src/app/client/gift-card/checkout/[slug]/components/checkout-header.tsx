import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { ICardOrderResponse, OrderStatus } from '@/types'

interface CheckoutHeaderProps {
  orderData: ICardOrderResponse
  isPolling: boolean
  pollAttempts: number
}

export default function CheckoutHeader({
  orderData,
  isPolling,
  pollAttempts,
}: CheckoutHeaderProps) {
  const { t } = useTranslation(['giftCard'])
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        {t('giftCard.checkoutTitle')} #{orderData.slug}
      </h2>
      <div className="flex items-center gap-4">
        {/* Polling status indicator */}
        {isPolling && (
          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>
              {t('giftCard.checkingPaymentStatus')}
              {pollAttempts > 0 && ` (${pollAttempts})`}
            </span>
          </div>
        )}
        {/* Payment completed indicator */}
        {orderData.paymentStatus === OrderStatus.COMPLETED && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <span className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-400"></span>
            <span>{t('giftCard.paymentCompleted', 'Payment Completed')}</span>
          </div>
        )}
      </div>
    </div>
  )
}
