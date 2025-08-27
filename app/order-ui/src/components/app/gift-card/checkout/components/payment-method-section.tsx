import { RadioGroup, RadioGroupItem, Label } from '@/components/ui'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { PaymentMethod, Role } from '@/constants'
import { Coins, CreditCard } from 'lucide-react'

interface PaymentMethodSectionProps {
  role?: string
  paymentMethod?: string
  onPaymentMethodChange?: (method: string) => void
}

export default function PaymentMethodSection({
  role,
  paymentMethod: initialPaymentMethod,
  onPaymentMethodChange,
}: PaymentMethodSectionProps) {
  const { t } = useTranslation('menu')
  const [paymentMethod, setPaymentMethod] = useState(
    initialPaymentMethod || PaymentMethod.BANK_TRANSFER,
  )

  const handlePaymentMethodSubmit = (value: PaymentMethod) => {
    setPaymentMethod(value)
    if (onPaymentMethodChange) {
      onPaymentMethodChange(value)
    }
  }

  return (
    <div className="mb-4 rounded border bg-gray-100 dark:border-gray-600 dark:bg-gray-800">
      <div className="bg-muted p-4">
        <Label className="text-md">{t('paymentMethod.title')}</Label>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          ({t('paymentMethod.cashMethodNote')})
        </div>
      </div>
      <RadioGroup
        defaultValue={paymentMethod || PaymentMethod.BANK_TRANSFER}
        className="min-w-full gap-6"
        onValueChange={handlePaymentMethodSubmit}
      >
        <div className="p-3 text-sm">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value={PaymentMethod.BANK_TRANSFER} id="r2" />
            <div className="flex items-center gap-1 pl-2 text-muted-foreground">
              <Label htmlFor="r2" className="flex items-center gap-1">
                <CreditCard size={20} />
                {t('paymentMethod.bankTransfer')}
              </Label>
            </div>
          </div>
          {role && role !== Role.CUSTOMER && (
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={PaymentMethod.CASH} id="r3" />
              <div className="flex items-center gap-1 pl-2 text-muted-foreground">
                <Label htmlFor="r3" className="flex items-center gap-1">
                  <Coins size={20} />
                  {t('paymentMethod.cash')}
                </Label>
              </div>
            </div>
          )}
        </div>
      </RadioGroup>
    </div>
  )
}
