import { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

import { DataTableColumnHeader } from '@/components/ui'
import { ChefOrderStatus, IChefOrders } from '@/types'
import { ConfirmUpdateChefOrderStatusDialog } from '@/components/app/dialog'
import { ChefOrderStatusBadge } from '@/components/app/badge'

export const usePendingChefOrdersColumns = (): ColumnDef<IChefOrders>[] => {
  const { t } = useTranslation(['chefArea'])
  const { t: tCommon } = useTranslation(['common'])

  return [
    {
      id: 'select',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={tCommon('common.action')} />
      ),
      cell: ({ row }) => {
        const chefOrder = row.original
        return (
          <>
            {chefOrder.status === ChefOrderStatus.PENDING ? (
              <div onClick={(e) => e.stopPropagation()}>
                <ConfirmUpdateChefOrderStatusDialog
                  chefOrder={chefOrder}
                />
              </div>
            ) : (
              <div className='pl-3'>
                <span className='italic text-green-500'>
                  {t('chefOrder.accepted')}
                </span>
              </div>
            )}
          </>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'slug',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('chefOrder.slug')} />
      ),
      cell: ({ row }) => {
        const slug = row.original.slug
        return <span className="text-sm text-muted-foreground">{slug}</span>
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('chefOrder.createdAt')} />
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
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('chefOrder.status')} />
      ),
      cell: ({ row }) => {
        const status = row.original.status
        return <span className="text-sm text-muted-foreground">
          <ChefOrderStatusBadge status={status} />
        </span>
      },
    },
    // {
    //   accessorKey: 'productName',
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title={t('chefOrder.productName')} />
    //   ),
    //   cell: ({ row }) => {
    //     const product = row.original.product
    //     return <span className="text-sm text-muted-foreground">{product.name}</span>
    //   },
    // },
    // {
    //   accessorKey: 'note',
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title={t('chefOrder.note')} />
    //   ),
    //   cell: ({ row }) => {
    //     const product = row.original.product
    //     return <span className="text-sm text-muted-foreground">{product?.note ? product?.note : t('chefOrder.noNote')}</span>
    //   },
    // },
  ]
}
