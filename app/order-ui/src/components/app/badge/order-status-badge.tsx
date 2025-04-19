import { useTranslation } from 'react-i18next'
import { DollarSign, PackageCheck, Clock, Truck, AlertCircle } from 'lucide-react'

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
        return 'bg-yellow-500 text-white'
      case OrderStatus.SHIPPING:
        return 'bg-indigo-700 text-white'
      case OrderStatus.COMPLETED:
        return 'bg-blue-500 text-white'
      case OrderStatus.PAID:
        return 'bg-green-500 text-white'
      case OrderStatus.FAILED:
        return 'bg-red-500 text-white'
      default:
        return 'bg-gray-400 text-white'
    }
  }

  const getBadgeIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PAID:
        return <DollarSign className="mr-1 w-3 h-3" />
      case OrderStatus.COMPLETED:
        return <PackageCheck className="mr-1 w-3 h-3" />
      case OrderStatus.SHIPPING:
        return <Truck className="mr-1 w-3 h-3" />
      case OrderStatus.PENDING:
        return <Clock className="mr-1 w-3 h-3" />
      case OrderStatus.FAILED:
        return <AlertCircle className="mr-1 w-3 h-3" />
      default:
        return null
    }
  }

  const getBadgeText = (order: IOrder) => {
    const { status, payment } = order

    if (status === OrderStatus.PENDING) {
      return t('order.pending') // "Waiting for Confirmation"
    }

    if (status === OrderStatus.PAID && payment?.statusCode === paymentStatus.COMPLETED) {
      return t('order.paid') // "Payment Received"
    }

    if (status === OrderStatus.SHIPPING) {
      return t('order.shipping') // "In Delivery"
    }

    if (status === OrderStatus.COMPLETED) {
      return t('order.completed') // "Delivered"
    }

    if (status === OrderStatus.FAILED) {
      return t('order.failed') // "Payment Failed" or similar
    }

    return t('order.unknown') // fallback
  }

  const status = order?.status || OrderStatus.FAILED

  return (
    <span
      className={`inline-flex items-center gap-1 w-fit min-w-32 px-3 py-1 text-center text-[0.7rem] ${getBadgeColor(
        status,
      )} rounded-full`}
    >
      {getBadgeIcon(status)}
      {order && getBadgeText(order)}
    </span>
  )
}
