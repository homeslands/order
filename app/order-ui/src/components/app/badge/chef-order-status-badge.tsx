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
        return 'border-yellow-500 bg-yellow-500 border text-white font-semibold'
      case ChefOrderStatus.COMPLETED:
        return 'border-green-500 bg-green-500 border text-white font-semibold'
      case ChefOrderStatus.ACCEPTED:
        return 'border-blue-500 bg-blue-500 border text-white font-semibold'
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
      className={`inline-block min-w-fit w-[80%] py-0.5 px-2 text-center text-[9px] md:text-[10px] lg:text-[12px] lg:px-3  ${getBadgeColor(
        status,
      )} rounded-full`}
    >
      {getBadgeText(status)}
    </span>
  )
}
