import { CircleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { PaymentMethodRadioGroup } from '@/components/app/radio'
import { Label } from '@/components/ui'
import { formatCurrency } from '@/utils'
import { PaymentMethod } from '@/constants'
import { IOrder } from '@/types'
interface PaymentMethodSelectProps {
  order?: IOrder
  paymentMethod: PaymentMethod | string
  qrCode?: string
  total?: number
  onSubmit?: (paymentMethod: PaymentMethod) => void
}

export default function ClientPaymentMethodSelect({
  order,
  paymentMethod,
  qrCode,
  total,
  onSubmit,
}: PaymentMethodSelectProps) {
  const { t } = useTranslation('menu')
  const handlePaymentMethodSubmit = (paymentMethodSubmit: PaymentMethod) => {
    if (onSubmit) {
      onSubmit(paymentMethodSubmit)
    }
  }

  return (
    <div className="flex flex-col gap-2 mt-6 w-full rounded-md border bg-background">
      <div className="flex flex-col gap-1 p-4 bg-muted">
        <Label className="text-md">{t('paymentMethod.title')}</Label>
        <span className='text-xs text-muted-foreground'>
          ({t('paymentMethod.cashMethodNote')})
        </span>
      </div>
      <div
        className={`grid ${qrCode ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}
      >
        <div className="flex flex-col col-span-1">
          <div className="p-4">
            <PaymentMethodRadioGroup order={order} defaultValue={paymentMethod} onSubmit={handlePaymentMethodSubmit} />
          </div>
          <div className="flex items-center gap-1 px-4 pb-4 text-[0.5rem] text-muted-foreground">
            <CircleAlert size={12} className="text-blue-500" />
            {t('paymentMethod.bankTransferProcessing')}
          </div>
        </div>
        {qrCode && paymentMethod === PaymentMethod.BANK_TRANSFER && (
          <div className="col-span-1 pb-4">
            <div className="flex flex-col justify-center items-center">
              <img src={qrCode} alt="QR Code" className="w-2/5" />
              <div className="flex flex-col gap-2 justify-center items-center">
                <div className="text-sm">
                  {t('paymentMethod.total')}
                  <span className="text-lg font-bold">
                    {formatCurrency(total || 0)}
                  </span>
                </div>
                <div className="flex gap-1 items-center px-4 text-xs text-muted-foreground">
                  <CircleAlert size={12} className="text-blue-500" />
                  {t('paymentMethod.paymentNote')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
