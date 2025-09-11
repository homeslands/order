import { useTranslation } from 'react-i18next'

import { LoyaltyPointHistoryType } from '@/constants'

interface ILoyaltyPointTypeBadgeProps {
  type: LoyaltyPointHistoryType
}

export default function LoyaltyPointTypeBadge({
  type,
}: ILoyaltyPointTypeBadgeProps) {
  const { t } = useTranslation(['loyaltyPoint'])

  const getBadgeColor = (type: LoyaltyPointHistoryType) => {
    switch (type) {
      case LoyaltyPointHistoryType.ADD:
        return 'bg-green-500 text-white'
      case LoyaltyPointHistoryType.USE:
        return 'bg-red-500 text-white'
      case LoyaltyPointHistoryType.RESERVE:
        return 'bg-gray-400 text-white'
      case LoyaltyPointHistoryType.REFUND:
        return 'bg-orange-500 text-white'
      default:
        return 'bg-gray-400 text-white'
    }
  }

  const getBadgeText = (type: LoyaltyPointHistoryType) => {
    switch (type) {
      case LoyaltyPointHistoryType.ADD:
        return t('loyaltyPoint.add')
      case LoyaltyPointHistoryType.USE:
        return t('loyaltyPoint.use')
      case LoyaltyPointHistoryType.RESERVE:
        return t('loyaltyPoint.reserve')
      case LoyaltyPointHistoryType.REFUND:
        return t('loyaltyPoint.refund')
    }
  }
  // Ensure the component returns valid JSX
  return (
    <span
      className={`inline-block w-fit rounded-full px-3 py-1 text-center text-xs ${getBadgeColor(
        type,
      )}`}
    >
      {getBadgeText(type)}
    </span>
  )
}
