import { ColumnDef } from '@tanstack/react-table'
import {
  DownloadIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

import {
  Button,
  DataTableColumnHeader,
} from '@/components/ui'
import { IOrder, OrderStatus, OrderTypeEnum } from '@/types'
import { PaymentMethod } from '@/constants'
import { useExportOrderInvoice } from '@/hooks'
import { formatCurrency, loadDataToPrinter, showToast } from '@/utils'
import OrderStatusBadge from '@/components/app/badge/order-status-badge'

export const useOrderHistoryColumns = (): ColumnDef<IOrder>[] => {
  const { t } = useTranslation(['menu'])
  const { t: tToast } = useTranslation(['toast'])
  const { mutate: exportOrderInvoice } = useExportOrderInvoice()

  const handleExportOrderInvoice = async (order: IOrder | undefined) => {
    exportOrderInvoice(order?.slug || '', {
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
          <div className="text-xs xl:text-sm">
            {createdAt ? moment(createdAt).format('HH:mm DD/MM/YYYY') : ''}
          </div>
        )
      },
    },
    {
      accessorKey: 'exportInvoice',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('order.exportInvoice')} />
      ),
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className="text-xs xl:text-sm">
            {(order.status !== OrderStatus.PENDING) && (
              <div onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="outline"
                  className="flex gap-1 justify-start px-2 w-full text-xs xl:text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportOrderInvoice(order);
                  }}
                >
                  <DownloadIcon />
                  {t('order.exportInvoice')}
                </Button>
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'orderReferenceNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('order.orderReferenceNumber')} />
      ),
      cell: ({ row }) => {
        const order = row.original
        return <div className="text-sm">{order?.referenceNumber || 'N/A'}</div>
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
        let paymentMethodValue = '';
        if (order?.payment?.paymentMethod === PaymentMethod.CASH) {
          paymentMethodValue = t('order.cash');
        }
        if (order?.payment?.paymentMethod === PaymentMethod.BANK_TRANSFER) {
          paymentMethodValue = t('order.bankTransfer')
        }
        if (order?.payment?.paymentMethod === PaymentMethod.POINT) {
          paymentMethodValue = t('order.point')
        }
        if (order?.payment?.paymentMethod === PaymentMethod.CREDIT_CARD) {
          paymentMethodValue = t('order.creditCard')
        }
        return (
          <div className="flex flex-col">
            <span className="text-[0.8rem]">
              {paymentMethodValue}
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
      accessorKey: 'pickupTime',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('menu.pickupTime')} />
      ),
      cell: ({ row }) => {
        const pickupTime = row.original.timeLeftTakeOut

        return row.original.type === OrderTypeEnum.TAKE_OUT ? (
          <div className={`text-sm ${pickupTime === 0 ? 'text-green-600' : 'text-destructive'}`}>
            {pickupTime === 0
              ? t('menu.immediately')
              : pickupTime
                ? `${t('menu.waiting')} ${pickupTime} ${t('menu.minutes')}`
                : ""}
          </div>
        ) : (
          <div className="text-sm">{t('menu.dineIn')}</div>
        )
      },
    },
    {
      accessorKey: 'orderStatus',
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
  ]
}