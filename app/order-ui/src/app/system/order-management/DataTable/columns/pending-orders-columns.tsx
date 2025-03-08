import { ColumnDef } from '@tanstack/react-table'
import { BikeIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

import { DataTableColumnHeader } from '@/components/ui'
import { IOrder, OrderTypeEnum } from '@/types'
import OrderStatusBadge from '@/components/app/badge/order-status-badge'

export const usePendingOrdersColumns = (): ColumnDef<IOrder>[] => {
  const { t } = useTranslation(['menu'])
  return [
    {
      accessorKey: 'icon',
      header: () => <div title="" />,
      cell: () => {
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary p-2.5">
            <BikeIcon className="text-white icon" />
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
        const slug = row.original.slug
        return <span className="text-sm text-muted-foreground">{slug}</span>
      },
    },
    {
      accessorKey: 'owner',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('order.customerName')}
        />
      ),
      cell: ({ row }) => {
        const owner =
          row.original.owner.firstName + ' ' + row.original.owner.lastName
        return (
          <div className="flex flex-col justify-start">
            <span className="text-sm font-medium">{owner}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('order.orderType')} />
      ),
      cell: ({ row }) => {
        const orderType = row.original
        return orderType?.type === OrderTypeEnum.AT_TABLE ? (
          <div>{t('order.dineIn')}</div>
        ) : (
          <div>{t('order.takeAway')}</div>
        )
      },
    },
    {
      accessorKey: 'table',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('order.table')} />
      ),
      cell: ({ row }) => {
        const order = row.original
        return order?.type === OrderTypeEnum.AT_TABLE ? (
          <div>{t('order.tableNumber')} {order?.table?.name}</div>
        ) : (
          <div>{t('order.takeAway')}</div>
        )
      },
    },
    {
      accessorKey: 'itemAmount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('order.itemAmount')} />
      ),
      cell: ({ row }) => {
        const orderItemCount = row.original.orderItems.length
        return (
          <div className="flex flex-col">
            <div className="flex gap-1 text-sm">
              <span>{orderItemCount}</span>
              {t('order.item').toLocaleLowerCase()}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('order.status')} />
      ),
      cell: ({ row }) => {
        const order = row.original
        return <OrderStatusBadge order={order} />
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('menu.createdAt')} />
      ),
      cell: ({ row }) => {
        const createdAt = row.getValue('createdAt')
        return (
          <span className="text-sm text-muted-foreground">
            {createdAt ? moment(createdAt).format('HH:mm DD/MM/YYYY') : ''}
          </span>
        )
      },
    },
    // {
    //   accessorKey: 'paymentMethod',
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title={t('order.paymentMethod')} />
    //   ),
    //   cell: ({ row }) => {
    //     const order = row.original
    //     return (

    //       <div className='flex flex-col'>
    //         <span className='text-xs'>
    //           {order?.payment && order?.payment.paymentMethod === PaymentMethod.CASH ? t('order.cash') : t('order.bankTransfer')}
    //         </span>
    //         <PaymentStatusBadge
    //           status={order?.invoice?.status}
    //         />
    //       </div>
    //     )
    //   },
    // },
  ]
}
