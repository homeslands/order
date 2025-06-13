import { useTranslation } from 'react-i18next'
import { ICardOrderResponse } from '@/types'

interface PaymentMethodSectionProps {
  orderData: ICardOrderResponse
}

export default function PaymentMethodSection({
  orderData,
}: PaymentMethodSectionProps) {
  const { t } = useTranslation(['giftCard'])

  return (
    <div className="mb-4 rounded border bg-gray-100">
      <div className="border-b px-3 py-2 font-semibold">
        {t('giftCard.paymentMethod')}
      </div>
      <div className="p-3 text-sm">
        {/* Payment instruction note */}
        <div className="mb-2 text-xs text-gray-600">
          {t(
            'giftCard.cashPaymentNote',
            'Note: For cash payment method, please go to the counter to make payment',
          )}
        </div>
        {/* Payment method indicator with orange dot */}
        <div className="flex items-center gap-2">
          <span className="mr-2 inline-block h-3 w-3 rounded-full bg-orange-400"></span>
          <span>
            {orderData.paymentMethod || t('giftCard.bankTransferPayment')}
          </span>
        </div>
      </div>
    </div>
  )
}
