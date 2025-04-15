import { useTranslation } from 'react-i18next'

import { ChefOrderItemStatus } from '@/types'
import { Badge } from '@/components/ui'

interface IChefOrderItemStatusBadgeProps {
  status: ChefOrderItemStatus
}

export default function ChefOrderItemStatusBadge({
  status,
}: IChefOrderItemStatusBadgeProps) {
  const { t } = useTranslation(['chefArea'])

  const getBadgeColor = (status: ChefOrderItemStatus) => {
    switch (status) {
      case ChefOrderItemStatus.PENDING:
        return 'border-yellow-500 bg-yellow-50 border text-yellow-500 font-semibold'
      case ChefOrderItemStatus.COMPLETED:
        return 'border-green-500 bg-green-50 border text-green-500 font-semibold'
      case ChefOrderItemStatus.IN_PROGRESS:
        return 'border-blue-500 bg-blue-50 border text-blue-500 font-semibold'
    }
  }

  const getBadgeText = (status: ChefOrderItemStatus) => {
    switch (status) {
      case ChefOrderItemStatus.PENDING:
        return t('chefOrder.pending')
      case ChefOrderItemStatus.COMPLETED:
        return t('chefOrder.completed')
      case ChefOrderItemStatus.IN_PROGRESS:
        return t('chefOrder.inProgress')
    }
  }
  // Ensure the component returns valid JSX
  return (
    <Badge
      className={`w-fit px-2 h-7 text-center text-xs ${getBadgeColor(
        status,
      )}`}
    >
      {getBadgeText(status)}
    </Badge>
  )
}
