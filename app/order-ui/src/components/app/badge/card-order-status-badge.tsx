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
        return 'bg-yellow-500 text-white'
      case CardOrderStatus.COMPLETED:
        return 'bg-green-500 text-white'
      case CardOrderStatus.FAILED:
      case CardOrderStatus.CANCELLED:
        return 'bg-red-500 text-white'
    }
  }

  const getBadgeText = (status: string) => {
    switch (status) {
      case CardOrderStatus.PENDING:
        return t('giftCard.cardOrder.pending')
      case CardOrderStatus.COMPLETED:
        return t('giftCard.cardOrder.completed')
      case CardOrderStatus.FAILED:
      case CardOrderStatus.CANCELLED:
        return t('giftCard.cardOrder.failed')
      default:
        return ''
    }
  }

  return (
    <span
      className={`w-fit min-w-32 px-3 py-2 text-center text-xs ${getBadgeColor(
        status
      )} rounded-full`}
    >
      {getBadgeText(status)}
    </span>
  )
}
