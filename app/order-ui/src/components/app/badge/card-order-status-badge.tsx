import { useTranslation } from 'react-i18next'

import { CardOrderStatus } from '@/constants'

interface ICardOrderStatusBadgeProps {
  status: string;
}

export default function CardOrderStatusBadge({ status }: ICardOrderStatusBadgeProps) {
  const { t } = useTranslation(['giftCard'])

  const getBadgeColor = (status: string) => {
    switch (status) {
      case CardOrderStatus.PENDING:
        return 'text-orange-400'
      case CardOrderStatus.COMPLETED:
        return 'text-green-600'
      case CardOrderStatus.FAILED:
      case CardOrderStatus.CANCELLED:
        return 'bright-red'
    }
  }

  const getBadgeText = (status: string) => {
    switch (status) {
      case CardOrderStatus.PENDING:
        return t('giftCard.cardOrder.pending')
      case CardOrderStatus.COMPLETED:
        return t('giftCard.cardOrder.completed')
      case CardOrderStatus.FAILED:
        return t('giftCard.cardOrder.fail')
      case CardOrderStatus.CANCELLED:
        return t('giftCard.cardOrder.cancelled')
      default:
        return ''
    }
  }

  return (
    <span
      className={`min-w-32 font-bold ${getBadgeColor(
        status
      )}`}>
      {getBadgeText(status)}
    </span>
  )
}
