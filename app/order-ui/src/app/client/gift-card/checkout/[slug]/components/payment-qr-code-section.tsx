import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui'
import { ICardOrderResponse } from '@/types'
import { formatCurrency } from '@/utils'

// Temporary interface for payment response structure
interface PaymentData {
  result?: {
    payment?: {
      qrCode?: string
    }
  }
}

interface PaymentQRCodeSectionProps {
  orderData: ICardOrderResponse
  isSuccessInitiatePayment: boolean
  initiatePaymentData: PaymentData | undefined
  isPendingInitiatePayment: boolean
  isExpired: boolean
  onInitiatePayment: () => void
}

export default function PaymentQRCodeSection({
  orderData,
  isSuccessInitiatePayment,
  initiatePaymentData,
  isPendingInitiatePayment,
  isExpired,
  onInitiatePayment,
}: PaymentQRCodeSectionProps) {
  const { t } = useTranslation(['giftCard'])

  return (
    <div className="flex flex-col items-center">
      {' '}
      {/* Payment initiation or QR code display */}
      {isSuccessInitiatePayment && initiatePaymentData ? (
        <>
          {/* QR code from payment API */}{' '}
          <img
            src={initiatePaymentData?.result?.payment?.qrCode || ''}
            alt={t('giftCard.paymentQRCode', 'Payment QR Code')}
            className="mb-4 h-48 w-48 rounded border bg-white p-2"
          />
          {/* Payment amount display */}
          <div className="mt-4 text-center">
            <div className="mb-1 text-base font-semibold">
              {t('giftCard.paymentAmount', 'Payment Amount')}:{' '}
              <span className="text-lg font-bold text-black">
                {formatCurrency(orderData.totalAmount)}
              </span>
            </div>
            {/* Payment verification note */}
            <div className="text-xs text-gray-600">
              {t(
                'giftCard.paymentVerificationNote',
                'Please verify payment information before proceeding with the transaction',
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Payment initiation button */}
          <Button
            onClick={onInitiatePayment}
            disabled={isPendingInitiatePayment || isExpired}
            className="mb-4 w-full md:w-auto"
          >
            {t('giftCard.initiatePayment')}
          </Button>
        </>
      )}
    </div>
  )
}
