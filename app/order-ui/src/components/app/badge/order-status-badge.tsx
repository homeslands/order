import { useTranslation } from 'react-i18next'

import { IOrder, OrderStatus } from '@/types'
import { paymentStatus } from '@/constants'

interface IOrderStatusBadgeProps {
  order: IOrder | undefined
}

export default function OrderStatusBadge({ order }: IOrderStatusBadgeProps) {
  const { t } = useTranslation(['menu'])

  const getBadgeColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-500 bg-yellow-50 text-white'
      case OrderStatus.SHIPPING:
        return 'bg-blue-500 bg-blue-50 text-white '
      case OrderStatus.COMPLETED:
        return 'bg-green-500 bg-green-50 text-white '
      case OrderStatus.PAID:
        return 'bg-green-500 bg-green-50 text-white'
      case OrderStatus.FAILED:
        return 'bg-destructive bg-destructive/20 text-white'
    }
  }

  const getBadgeText = (order: IOrder) => {
    if (
      order?.status === OrderStatus.PENDING &&
      order?.payment?.statusCode === paymentStatus.PENDING
    ) {
      return t('order.pending')
    } else if (
      order?.status === OrderStatus.PENDING &&
      order?.payment === null
    ) {
      return t('order.pending')
    } else if (
      order?.status === OrderStatus.PENDING &&
      order?.payment?.statusCode === paymentStatus.COMPLETED
    ) {
      return t('order.pending')
    } else if (
      order?.status === OrderStatus.PAID &&
      order?.payment?.statusCode === paymentStatus.COMPLETED
    ) {
      return t('order.paid')
    } else if (
      order?.status === OrderStatus.SHIPPING &&
      order?.payment?.statusCode === paymentStatus.COMPLETED
    ) {
      return t('order.shipping')
    } else if (
      order?.status === OrderStatus.SHIPPING &&
      order?.payment?.statusCode === paymentStatus.PENDING
    ) {
      return t('order.shipping')
    } else if (
      order?.status === OrderStatus.COMPLETED &&
      order?.payment?.statusCode === paymentStatus.PENDING
    ) {
      return t('order.completed')
    } else if (
      order?.status === OrderStatus.COMPLETED &&
      order?.payment?.statusCode === paymentStatus.COMPLETED
    ) {
      return t('order.completed')
    } else {
      return t('order.unknown')
    }
  }

  return (
    <span
      className={`inline-block w-fit px-3 py-0.5 text-center text-[0.7rem] ${getBadgeColor(
        order?.status || OrderStatus.FAILED,
      )} rounded-full`}
    >
      {getBadgeText(order as IOrder)}
    </span>
  )
}
