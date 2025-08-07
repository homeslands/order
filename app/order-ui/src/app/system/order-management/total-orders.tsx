import { IOrder } from '@/types'
import { ShoppingCartIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ITotalOrdersProps {
  orders: IOrder[]
}

export default function TotalOrders({ orders }: ITotalOrdersProps) {
  const { t } = useTranslation(['menu'])
  return (
    <div className="flex h-[8rem] min-w-[12rem] flex-col justify-between rounded-md border bg-primary p-6 text-white">
      <div className="text-md flex flex-row items-center justify-between">
        {t('order.totalOrders')}
        <div className="flex h-fit w-fit items-center justify-center rounded-lg bg-white p-3">
          <ShoppingCartIcon className="icon text-primary" />
        </div>
      </div>
      <span className="flex h-full items-center text-3xl">{orders.length}</span>
    </div>
  )
}
