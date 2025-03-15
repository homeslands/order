import { Coins, CreditCard } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { RadioGroup, RadioGroupItem, Label } from '@/components/ui'
import { PaymentMethod, Role } from '@/constants'
import { useUserStore } from '@/stores'

interface PaymentMethodRadioGroupProps {
  defaultValue?: string
  onSubmit?: (paymentMethod: PaymentMethod) => void
}
export default function PaymentMethodRadioGroup({
  defaultValue,
  onSubmit,
}: PaymentMethodRadioGroupProps) {
  const { t } = useTranslation('menu')
  const { userInfo } = useUserStore()

  const handlePaymentMethodChange = (paymentMethod: PaymentMethod) => {
    if (onSubmit) {
      onSubmit(paymentMethod)
    }
  }
  return (
    <RadioGroup
      defaultValue={defaultValue || PaymentMethod.BANK_TRANSFER}
      className="min-w-full gap-6"
      onValueChange={handlePaymentMethodChange}
    >
      {/* <div className="flex items-center space-x-2">
        <RadioGroupItem value="internalWallet" id="r1" />
        <div className="flex items-center gap-1 pl-2 text-muted-foreground">
          <Label htmlFor="r1" className="flex items-center gap-1">
            <WalletMinimal size={20} />
            {t('paymentMethod.internalWallet')} (coming soon)
          </Label>
        </div>
      </div> */}
      <div className="flex items-center space-x-2">
        <RadioGroupItem value={PaymentMethod.BANK_TRANSFER} id="r2" />
        <div className="flex items-center gap-1 pl-2 text-muted-foreground">
          <Label htmlFor="r2" className="flex items-center gap-1">
            <CreditCard size={20} />
            {t('paymentMethod.bankTransfer')}
          </Label>
        </div>
      </div>
      {userInfo?.role.name !== Role.CUSTOMER && (
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
    </RadioGroup>
  )
}
