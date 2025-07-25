import { useTranslation } from 'react-i18next'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { GiftCardType } from '@/constants'
import { IGiftCardFlagFeature } from '@/types'

interface GiftCardTypeSelectProps {
  value: GiftCardType
  onChange: (value: GiftCardType) => void
  className?: string
  featureFlags: IGiftCardFlagFeature[]
}

export default function GiftCardTypeSelect({
  value,
  onChange,
  className,
  featureFlags,
}: GiftCardTypeSelectProps) {
  const { t } = useTranslation(['giftCard'])
  const typeLabels = {
    [GiftCardType.SELF]: t('giftCard.buyForSelf'),
    [GiftCardType.GIFT]: t('giftCard.giftToOthers'),
    [GiftCardType.BUY]: t('giftCard.purchaseGiftCard'),
    [GiftCardType.NONE]: t('giftCard.giftCardLock'),
  }

  const isAllLocked = featureFlags.every((flag) => flag.isLocked)
  const availableFlags = featureFlags.filter(
    (flag) => !flag.isLocked && Object.values(GiftCardType).includes(flag.name),
  )

  return (
    <>
      {featureFlags && (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className={className}>
            <SelectValue>{typeLabels[value]}</SelectValue>
          </SelectTrigger>
          {isAllLocked ? (
            <SelectContent className="w-max">
              <SelectItem value={GiftCardType.NONE} disabled>
                {t('giftCard.giftCardLock')}
              </SelectItem>
            </SelectContent>
          ) : (
            <SelectContent className="w-max">
              {availableFlags.map((flag) => (
                <SelectItem key={flag.name} value={flag.name as GiftCardType}>
                  {typeLabels[flag.name as GiftCardType]}
                </SelectItem>
              ))}
            </SelectContent>
          )}
        </Select>
      )}
    </>
  )
}
