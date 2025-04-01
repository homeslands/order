import { NavLink } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import {
  MoreHorizontal,
  CreditCard,
  DownloadIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

import {
  Button,
  DataTableColumnHeader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui'
import { IOrder, OrderStatus, OrderTypeEnum } from '@/types'
import { PaymentMethod, paymentStatus, ROUTE } from '@/constants'
import { useExportOrderInvoice, useExportPayment } from '@/hooks'
import { formatCurrency, loadDataToPrinter, showToast } from '@/utils'
import OrderStatusBadge from '@/components/app/badge/order-status-badge'
import { OutlineCancelOrderDialog } from '@/components/app/dialog'

export const useOrderHistoryColumns = (): ColumnDef<IOrder>[] => {
  const { t } = useTranslation(['menu'])
  const { t: tToast } = useTranslation(['toast'])
  const { t: tCommon } = useTranslation(['common'])
  const { mutate: exportOrderInvoice } = useExportOrderInvoice()
  const { mutate: exportPayment } = useExportPayment()

  const handleExportPayment = (slug: string) => {
    exportPayment(slug, {
      onSuccess: (data: Blob) => {
        showToast(tToast('toast.exportPaymentSuccess'))
        // Load data to print
        loadDataToPrinter(data)
      },
    })
  }

  const handleExportOrderInvoice = (slug: string) => {
    exportOrderInvoice(slug, {
      onSuccess: (data: Blob) => {
        showToast(tToast('toast.exportInvoiceSuccess'))
        // Load data to print
        loadDataToPrinter(data)
      },
    })
  }
  return [
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('menu.createdAt')} />
      ),
      cell: ({ row }) => {
        const createdAt = row.getValue('createdAt')
        return (
          <div className="text-sm">
            {createdAt ? moment(createdAt).format('HH:mm DD/MM/YYYY') : ''}
          </div>
        )
      },
    },
    {
      accessorKey: 'slug',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('order.slug')} />
      ),
      cell: ({ row }) => {
        const order = row.original
        return <div className="text-sm">{order?.slug || 'N/A'}</div>
      },
    },
    {
      accessorKey: 'paymentMethod',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('order.paymentMethod')}
        />
      ),
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className="flex flex-col">
            <span className="text-[0.8rem]">
              {order?.payment &&
                order?.payment?.paymentMethod === PaymentMethod.CASH
                ? t('order.cash')
                : t('order.bankTransfer')}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'owner',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('order.owner')} />
      ),
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className="text-sm">
            {order?.owner?.firstName || ''} {order?.owner?.lastName || ''}
          </div>
        )
      },
    },
    {
      accessorKey: 'table',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('order.table')} />
      ),
      cell: ({ row }) => {
        const location = row.original.type === OrderTypeEnum.AT_TABLE ? t('order.at-table') + " " + row.original.table?.name || "" : t('order.take-out')
        return <div className="text-sm">{location}</div>
      },
    },
    {
      accessorKey: 'paymentStatus',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('order.orderStatus')} />
      ),
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className="flex flex-col">
            <OrderStatusBadge order={order} />
          </div>
        )
      },
    },
    {
      accessorKey: 'subtotal',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('order.subtotal')} />
      ),
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className="text-sm">{formatCurrency(order?.subtotal || 0)}</div>
        )
      },
    },
    {
      id: 'actions',
      header: tCommon('common.action'),
      cell: ({ row }) => {
        const order = row.original
        return (
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 w-8 h-8">
                  <span className="sr-only">{tCommon('common.action')}</span>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {tCommon('common.action')}
                </DropdownMenuLabel>
                {order?.slug &&
                  order?.status === OrderStatus.PENDING &&
                  (!order?.payment?.statusCode ||
                    order?.payment.statusCode === paymentStatus.PENDING) && (
                    <NavLink
                      to={`${ROUTE.STAFF_ORDER_PAYMENT}?order=${order.slug}`}
                      className="flex justify-start items-center w-full"
                    >
                      <Button
                        variant="ghost"
                        className="flex gap-1 justify-start px-2 w-full text-sm"
                      >
                        <CreditCard className="icon" />
                        {t('order.updatePayment')}
                      </Button>
                    </NavLink>
                  )}

                {/* Export payment */}
                {order?.payment?.slug && (
                  <Button
                    onClick={() => handleExportPayment(order.payment!.slug)}
                    variant="ghost"
                    className="flex gap-1 justify-start px-2 w-full"
                  >
                    <DownloadIcon />
                    {t('order.exportPayment')}
                  </Button>
                )}

                {/* Export invoice */}
                {order?.slug &&
                  order?.payment?.statusCode === paymentStatus.COMPLETED && (
                    <Button
                      onClick={() => handleExportOrderInvoice(order.slug)}
                      variant="ghost"
                      className="flex gap-1 justify-start px-2 w-full"
                    >
                      <DownloadIcon />
                      {t('order.exportInvoice')}
                    </Button>
                  )}

                {/* Cancel order */}
                {!(order && order.status === OrderStatus.PAID && order.payment.statusCode === paymentStatus.COMPLETED) && <OutlineCancelOrderDialog order={order} />}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}
