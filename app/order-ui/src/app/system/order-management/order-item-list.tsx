import { useTranslation } from 'react-i18next'

import { ChefOrderItemStatus, IOrder } from '@/types'
import OrderItemDetail from './order-item-detail'
import { ScrollArea } from '@/components/ui'
import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react'

interface IOrderItemListProps {
  orderDetailData?: IOrder
}

export default function OrderItemList({
  orderDetailData,
}: IOrderItemListProps) {
  const { t } = useTranslation(['menu'])

  const getStatusCounts = () => {
    if (!orderDetailData?.orderItems) {
      return { pending: 0, running: 0, completed: 0, failed: 0 }
    }

    return orderDetailData.orderItems.reduce(
      (acc, item) => {
        // Check if item is completed in kitchen
        const isCompletedInKitchen = item.chefOrderItems?.some(
          (chefItem) => chefItem.status === ChefOrderItemStatus.COMPLETED
        )

        // Check if item has any delivery status
        const hasDeliveryStatus = item.status.PENDING || item.status.RUNNING || item.status.COMPLETED || item.status.FAILED

        // If completed in kitchen but no delivery status, count as pending
        if (isCompletedInKitchen && !hasDeliveryStatus) {
          acc.pending += 1
        } else if (!isCompletedInKitchen) {
          // Only count as pending if not completed in kitchen
          acc.pending += item.status.PENDING ? 1 : 0
        }

        acc.running += item.status.RUNNING ? 1 : 0
        acc.completed += item.status.COMPLETED ? 1 : 0
        acc.failed += item.status.FAILED ? 1 : 0
        return acc
      },
      { pending: 0, running: 0, completed: 0, failed: 0 }
    )
  }

  const { pending, running, completed, failed } = getStatusCounts()

  return (
    <div className="flex flex-col gap-1">
      <span className="flex justify-between items-center py-1 font-semibold text-md">
        {t('order.orderDetail')}
      </span>

      <div className="flex flex-col w-full">
        <ScrollArea>
          <div className="relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted-foreground/20 -translate-y-1/2"></div>
            <div className="flex relative justify-between">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${pending > 0 ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                  <Clock className={`w-4 h-4 ${pending > 0 ? 'text-yellow-500' : 'text-gray-400'}`} />
                </div>
                <span className="mt-1 text-[0.5rem] sm:text-xs font-bold text-muted-foreground">{t('order.deliveryPending')}</span>
                <span className="text-[0.5rem] sm:text-xs text-gray-500">{pending} {t('order.items')}</span>
              </div>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${running > 0 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <AlertCircle className={`w-4 h-4 ${running > 0 ? 'text-blue-500' : 'text-gray-400'}`} />
                </div>
                <span className="mt-1 text-[0.5rem] sm:text-xs font-bold text-muted-foreground">{t('order.shipping')}</span>
                <span className="text-[0.5rem] sm:text-xs text-gray-500">{running} {t('order.items')}</span>
              </div>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${completed > 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <CheckCircle2 className={`w-4 h-4 ${completed > 0 ? 'text-green-500' : 'text-gray-400'}`} />
                </div>
                <span className="mt-1 text-[0.5rem] sm:text-xs font-bold text-muted-foreground">{t('order.completed')}</span>
                <span className="text-[0.5rem] sm:text-xs text-gray-500">{completed} {t('order.items')}</span>
              </div>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${failed > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                  <XCircle className={`w-4 h-4 ${failed > 0 ? 'text-red-500' : 'text-gray-400'}`} />
                </div>
                <span className="mt-1 text-[0.5rem] sm:text-xs font-bold text-muted-foreground">{t('order.failed')}</span>
                <span className="text-[0.5rem] sm:text-xs text-gray-500">{failed} {t('order.items')}</span>
              </div>
            </div>
          </div>
          {orderDetailData?.orderItems?.map((item) => (
            <div key={item.slug} className="grid gap-4 items-center w-full">
              <OrderItemDetail order={item} />
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  )
}
