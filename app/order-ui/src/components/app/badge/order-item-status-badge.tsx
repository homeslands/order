import { useTranslation } from 'react-i18next'

import { OrderItemStatus } from '@/types'

interface IOrderItemStatusBadgeProps {
  status: OrderItemStatus
  rounded?: string
}

export default function OrderItemStatusBadge({
  status, rounded
}: IOrderItemStatusBadgeProps) {
  const { t } = useTranslation(['menu'])

  const getBadgeColor = (status: OrderItemStatus) => {
    switch (status) {
      case OrderItemStatus.PENDING:
        return 'border-yellow-500 bg-yellow-50 border text-yellow-500 font-semibold'
      case OrderItemStatus.COMPLETED:
        return 'border-green-500 bg-green-50 border text-green-500 font-semibold'
      case OrderItemStatus.RUNNING:
        return 'border-blue-500 bg-blue-50 border text-blue-500 font-semibold'
      case OrderItemStatus.FAILED:
        return 'border-destructive bg-destructive/20 border text-destructive'
    }
  }

  const getBadgeText = (status: OrderItemStatus) => {
    switch (status) {
      case OrderItemStatus.PENDING:
        return t('order.deliveryPending')
      case OrderItemStatus.RUNNING:
        return t('order.shipping')
      case OrderItemStatus.COMPLETED:
        return t('order.completed')
      case OrderItemStatus.FAILED:
        return t('order.failed')
    }
  }
  // Ensure the component returns valid JSX
  return (
    <span
      className={`inline-block w-fit px-2 py-1 text-center text-[0.5rem] ${getBadgeColor(
        status,
      )} ${rounded === 'md' ? 'rounded-md' : 'rounded-full'} `}
    >
      {getBadgeText(status)}
    </span>
  )
}
