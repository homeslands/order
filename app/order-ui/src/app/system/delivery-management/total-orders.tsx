import { ShoppingCartIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ITotalOrdersProps {
  orderTotal?: number
}

export default function TotalOrders({ orderTotal }: ITotalOrdersProps) {
  const { t } = useTranslation(['menu'])
  return (
    <div className="flex h-[8rem] min-w-[12rem] flex-col justify-between rounded-md border bg-primary p-6 text-white">
      <div className="flex flex-row items-center justify-between text-md">
        {t('order.totalOrders')}
        <div className="flex items-center justify-center p-3 bg-white rounded-lg h-fit w-fit">
          <ShoppingCartIcon className="icon text-primary" />
        </div>
      </div>
      <span className="flex items-center h-full text-3xl">{orderTotal}</span>
    </div>
  )
}
