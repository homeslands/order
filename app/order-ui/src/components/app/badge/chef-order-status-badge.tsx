import { useTranslation } from 'react-i18next'

import { ChefOrderStatus } from '@/types'

interface IChefOrderStatusBadgeProps {
  status: ChefOrderStatus
}

export default function ChefOrderStatusBadge({
  status,
}: IChefOrderStatusBadgeProps) {
  const { t } = useTranslation(['chefArea'])

  const getBadgeColor = (status: ChefOrderStatus) => {
    switch (status) {
      case ChefOrderStatus.PENDING:
        return 'border-yellow-500 bg-yellow-50 border text-yellow-500 font-semibold'
      case ChefOrderStatus.COMPLETED:
        return 'border-green-500 bg-green-50 border text-green-500 font-semibold'
      case ChefOrderStatus.ACCEPTED:
        return 'border-blue-500 bg-blue-50 border text-blue-500 font-semibold'
      case ChefOrderStatus.REJECTED:
        return 'border-destructive bg-destructive/20 border text-destructive'
    }
  }

  const getBadgeText = (status: ChefOrderStatus) => {
    switch (status) {
      case ChefOrderStatus.PENDING:
        return t('chefOrder.pending')
      case ChefOrderStatus.ACCEPTED:
        return t('chefOrder.accepted')
      case ChefOrderStatus.COMPLETED:
        return t('chefOrder.completed')
      case ChefOrderStatus.REJECTED:
        return t('chefOrder.rejected')
    }
  }
  // Ensure the component returns valid JSX
  return (
    <span
      className={`inline-block w-fit px-2 py-1 text-center text-[0.5rem] ${getBadgeColor(
        status,
      )} rounded-full`}
    >
      {getBadgeText(status)}
    </span>
  )
}
