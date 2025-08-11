import moment from 'moment'
import { NavLink } from 'react-router-dom'
import { Clock, ShoppingCartIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { IOrder } from '@/types'
import { Button } from '@/components/ui'
import OrderStatusBadge from '@/components/app/badge/order-status-badge'
import { ROUTE } from '@/constants'
import { useExportOrderInvoice } from '@/hooks'
import { formatCurrency, showToast } from '@/utils'

interface OrderItemDetailProps {
  order: IOrder
}

export default function OrderItemDetail({ order }: OrderItemDetailProps) {
  const { t } = useTranslation(['menu'])
  const { mutate: exportInvoice } = useExportOrderInvoice()

  const handleExportInvoice = () => {
    exportInvoice(order.slug, {
      onSuccess: () => {
        showToast(t('toast.exportInvoiceSuccess'))
      },
    })
  }

  return (
    <div
      key={order.slug}
      className="grid grid-cols-5 gap-4 px-2 py-4 border-b cursor-pointer"
    >
      <div className="justify-start col-span-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center p-2 h-9 w-9 rounded-xl bg-primary/10">
            <ShoppingCartIcon className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-muted-foreground">
              {order.owner?.firstName} {order.owner?.lastName}
            </span>
            <span className="text-xs text-muted-foreground">
              {order.table.name}
            </span>
          </div>
        </div>
      </div>
      <div className="col-span-1">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">
            {order.orderItems?.length} {t('order.item')}
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            {formatCurrency(order.subtotal)}
          </span>
        </div>
      </div>
      <div className="flex items-center col-span-1">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {moment(order.createdAt).format('HH:mm DD/MM/YYYY')}
          </span>
        </div>
      </div>
      <div className="col-span-1">
        <OrderStatusBadge order={order} />
      </div>
      <div className="flex justify-end col-span-1 gap-2">
        <NavLink to={`${ROUTE.STAFF_ORDER_MANAGEMENT}/${order.slug}`}>
          <Button
            variant="outline"
            className="text-xs border-primary text-primary hover:bg-primary/10 hover:text-primary"
          >
            {t('order.viewDetail')}
          </Button>
        </NavLink>
        {/* Export invoice */}
        <Button
          onClick={handleExportInvoice}
          variant="outline"
          className="text-xs border-primary text-primary hover:bg-primary/10 hover:text-primary"
        >
          {t('order.exportInvoice')}
        </Button>
      </div>
    </div>
  )
}
