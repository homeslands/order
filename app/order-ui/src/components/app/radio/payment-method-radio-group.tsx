import { Coins, CreditCard, CircleDollarSign, CoinsIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { RadioGroup, RadioGroupItem, Label } from '@/components/ui'
import { PaymentMethod, Role } from '@/constants'
import { useUserStore } from '@/stores'
import { useGetUserBalance } from '@/hooks'
import { formatCurrency } from '@/utils'

interface PaymentMethodRadioGroupProps {
  defaultValue?: string
  onSubmit?: (paymentMethod: PaymentMethod) => void
}
export default function PaymentMethodRadioGroup({
  defaultValue,
  onSubmit,
}: PaymentMethodRadioGroupProps) {
  const { t } = useTranslation('menu')
  const { t: tProfile } = useTranslation('profile')
  const { userInfo } = useUserStore()
  const { data: balanceData } = useGetUserBalance(
    userInfo?.slug,
    !!userInfo?.slug,
  )
  const balance = balanceData?.result?.points || 0

  const handlePaymentMethodChange = (paymentMethod: PaymentMethod) => {
    if (onSubmit) {
      onSubmit(paymentMethod)
    }
  }
  return (
    <RadioGroup
      defaultValue={defaultValue || PaymentMethod.BANK_TRANSFER}
      className="gap-6 min-w-full"
      onValueChange={handlePaymentMethodChange}
    >
      {/* <div className="flex items-center space-x-2">
        <RadioGroupItem value="internalWallet" id="r1" />
        <div className="flex gap-1 items-center pl-2 text-muted-foreground">
          <Label htmlFor="r1" className="flex gap-1 items-center">
            <WalletMinimal size={20} />
            {t('paymentMethod.internalWallet')} (coming soon)
          </Label>
        </div>
      </div> */}
      <div className="flex items-center space-x-2">
        <RadioGroupItem value={PaymentMethod.BANK_TRANSFER} id="r2" />
        <div className="flex gap-1 items-center pl-2 text-muted-foreground">
          <Label htmlFor="r2" className="flex gap-1 items-center">
            <CreditCard size={20} />
            {t('paymentMethod.bankTransfer')}
          </Label>
        </div>
      </div>
      {userInfo && userInfo.role.name !== Role.CUSTOMER && (
        <div className="flex items-center space-x-2">
          <RadioGroupItem value={PaymentMethod.CASH} id="r3" />
          <div className="flex gap-1 items-center pl-2 text-muted-foreground">
            <Label htmlFor="r3" className="flex gap-1 items-center">
              <Coins size={20} />
              {t('paymentMethod.cash')}
            </Label>
          </div>
        </div>
      )}
      {userInfo && userInfo.role.name == Role.CUSTOMER && (
        <div className="flex space-x-2">
          <RadioGroupItem
            value={PaymentMethod.POINT}
            id="r4"
            className="mt-[2px]"
          />
          <div className="flex flex-col space-x-2">
            <div className="flex items-center gap-1 pl-2 text-muted-foreground">
              <Label htmlFor="r4" className="flex items-center gap-1">
                <CircleDollarSign size={20} />
                <span className="flex flex-col">
                  <span>{t('paymentMethod.coin')}</span>
                </span>
              </Label>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-primary">
              {tProfile('profile.coinBalance')}: {formatCurrency(balance, '')}
              <CoinsIcon className="h-4 w-4 text-primary" />
            </span>
          </div>
        </div>
      )}
    </RadioGroup>
  )
}
