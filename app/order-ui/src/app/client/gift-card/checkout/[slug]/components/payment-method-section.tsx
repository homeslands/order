import { useTranslation } from 'react-i18next'

export default function PaymentMethodSection() {
  const { t } = useTranslation(['giftCard'])
  return (
    <div className="mb-4 rounded border bg-gray-100 dark:border-gray-600 dark:bg-gray-800">
      <div className="border-b border-gray-300 px-3 py-2 font-semibold text-gray-900 dark:border-gray-600 dark:text-white">
        {t('giftCard.paymentMethod')}
      </div>
      <div className="p-3 text-sm">
        {/* Payment instruction note */}
        <div className="mb-2 text-xs text-gray-600 dark:text-gray-400">
          {t(
            'giftCard.cashPaymentNote',
            'Note: For cash payment method, please go to the counter to make payment',
          )}
        </div>
        {/* Payment method indicator with orange dot */}
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <span className="mr-2 inline-block h-3 w-3 rounded-full bg-orange-400"></span>
          <span>{t('giftCard.bankTransferPayment')}</span>
        </div>
      </div>
    </div>
  )
}
