import { FormControl, FormItem, FormLabel, Input } from '@/components/ui'
import { useUserStore } from '@/stores'
import { useTranslation } from 'react-i18next'

export default function CashierInfo() {
  const { t } = useTranslation(['giftCard'])
  const { userInfo } = useUserStore()
  const cashierName = `${userInfo?.firstName || ''} ${userInfo?.lastName || ''}`
  const cashierPhone = `${userInfo?.phonenumber || ''}`
  const cashier = cashierName + (cashierPhone ? ` (${cashierPhone})` : '')
  return (
    <FormItem>
      <FormLabel>
        {t('giftCard.cashierInfo.cashierName')}
        <span className="text-destructive dark:text-red-400">*</span>
      </FormLabel>
      <FormControl>
        <Input
          placeholder={t('giftCard.cashierInfo.cashierName')}
          disabled
          value={cashier}
        />
      </FormControl>
    </FormItem>
  )
}
