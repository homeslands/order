import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { GiftCardType } from '@/constants'
import { IGiftCardFlagFeature } from '@/types'
import { getGiftCardTypeLabel } from '@/utils'

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
  const isAllLocked = featureFlags.every((flag) => flag.isLocked)
  const availableFlags = featureFlags.filter(
    (flag) => !flag.isLocked && Object.values(GiftCardType).includes(flag.name),
  )

  return (
    <>
      {featureFlags && (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className={className}>
            <SelectValue>{getGiftCardTypeLabel(value)}</SelectValue>
          </SelectTrigger>
          {isAllLocked ? (
            <SelectContent className="w-max">
              <SelectItem value={GiftCardType.NONE} disabled>
                {getGiftCardTypeLabel(GiftCardType.NONE)}
              </SelectItem>
            </SelectContent>
          ) : (
            <SelectContent className="w-max">
              {availableFlags.map((flag) => (
                <SelectItem key={flag.name} value={flag.name as GiftCardType}>
                  {getGiftCardTypeLabel(flag.name as GiftCardType)}
                </SelectItem>
              ))}
            </SelectContent>
          )}
        </Select>
      )}
    </>
  )
}
