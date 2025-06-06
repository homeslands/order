import { useTranslation } from 'react-i18next'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { GiftCardType } from '@/constants'

interface GiftCardTypeSelectProps {
  value: GiftCardType
  onChange: (value: GiftCardType) => void
  className?: string
}

export default function GiftCardTypeSelect({
  value,
  onChange,
  className,
}: GiftCardTypeSelectProps) {
  const { t } = useTranslation(['giftCard'])
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue>
          {value === GiftCardType.SELF
            ? t('giftCard.buyForSelf')
            : t('giftCard.giftToOthers')}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="w-max">
        <SelectItem value={GiftCardType.SELF}>
          {t('giftCard.buyForSelf')}
        </SelectItem>
        <SelectItem value={GiftCardType.GIFT}>
          {t('giftCard.giftToOthers')}
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
