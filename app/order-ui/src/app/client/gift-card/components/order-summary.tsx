import { Coins } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui'
import { formatCurrency } from '@/utils'

interface OrderSummaryProps {
  totalPoints: number
  totalAmount: number
  onCheckout: () => void
}

export default function OrderSummary({
  totalPoints,
  totalAmount,
  onCheckout,
}: OrderSummaryProps) {
  const { t } = useTranslation(['giftCard'])

  return (
    <div className="sticky bottom-0 border-t bg-white p-6 font-semibold text-primary">
      <div className="rounded-lg border p-4">
        <div className="mb-2 flex items-center justify-between">
          <span>{t('giftCard.totalPoints')}</span>
          <div className="flex items-center gap-1">
            <span>{formatCurrency(totalPoints, '')}</span>
            <Coins className="h-5 w-5 text-yellow-500" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span>{t('giftCard.total')}</span>
          <span>{formatCurrency(totalAmount)}</span>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button className="w-max rounded-full" onClick={onCheckout}>
          {t('giftCard.checkout')}
        </Button>
      </div>
    </div>
  )
}
