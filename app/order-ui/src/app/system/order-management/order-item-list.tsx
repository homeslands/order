import { useTranslation } from 'react-i18next'

import { IOrder } from '@/types'
import OrderItemDetail from './order-item-detail'
import { ScrollArea } from '@/components/ui'

interface IOrderItemListProps {
  orderDetailData?: IOrder
}

export default function OrderItemList({
  orderDetailData,
}: IOrderItemListProps) {
  const { t } = useTranslation(['menu'])
  return (
    <div className="flex flex-col gap-1">
      <span className="flex justify-between items-center py-1 font-semibold text-md">
        {t('order.orderDetail')}
      </span>

      <div className="flex flex-col w-full">
        <ScrollArea>
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
