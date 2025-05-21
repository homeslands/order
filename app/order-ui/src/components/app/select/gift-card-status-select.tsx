import { useTranslation } from 'react-i18next'
import { GiftCardStatus } from '@/constants'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'

interface GiftCardStatusSelectProps {
  value?: string
  onChange: (value: string) => void
}

export default function GiftCardStatusSelect({
  value,
  onChange,
}: GiftCardStatusSelectProps) {
  const { t } = useTranslation('giftCard')

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={t('giftCard.chooseStatus')} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{t('giftCard.status')}</SelectLabel>
          {Object.values(GiftCardStatus).map((status) => (
            <SelectItem key={status} value={status}>
              <span>{t(`giftCard.${status.toLowerCase()}`)}</span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
