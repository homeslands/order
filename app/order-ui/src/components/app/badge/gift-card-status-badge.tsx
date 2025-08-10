import { useTranslation } from 'react-i18next'

import { GiftCardUsageStatus } from '@/constants'
import { Badge } from '@/components/ui'

interface IGiftCardStatusBadgeProps {
  status: GiftCardUsageStatus | string
  rounded?: string
}

export default function GiftCardStatusBadge({
  status,
  rounded,
}: IGiftCardStatusBadgeProps) {
  const { t } = useTranslation(['profile'])

  const getBadgeColor = (status: GiftCardUsageStatus | string) => {
    switch (status) {
      case GiftCardUsageStatus.AVAILABLE:
        return 'bg-blue-500 text-white font-semibold'
      case GiftCardUsageStatus.USED:
        return 'bg-green-500 text-white font-semibold'
      case GiftCardUsageStatus.EXPIRED:
        return 'bg-red-500 text-white font-semibold'
      default:
        return 'bg-gray-500 text-white font-semibold'
    }
  }

  const getBadgeText = (status: GiftCardUsageStatus | string) => {
    switch (status) {
      case GiftCardUsageStatus.AVAILABLE:
        return t('profile.giftCard.status.available')
      case GiftCardUsageStatus.USED:
        return t('profile.giftCard.status.used')
      case GiftCardUsageStatus.EXPIRED:
        return t('profile.giftCard.status.expired')
      default:
        return status
    }
  }

  return (
    <Badge
      className={`w-fit px-2 py-1 text-xs ${getBadgeColor(status)} ${rounded === 'md' ? 'rounded-md' : 'rounded-full'}`}
    >
      {getBadgeText(status)}
    </Badge>
  )
}
