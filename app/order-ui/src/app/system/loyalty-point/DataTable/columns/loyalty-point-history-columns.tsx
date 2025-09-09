import { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

import { DataTableColumnHeader } from '@/components/ui'
import { ILoyaltyPointHistory } from '@/types'

export const useLoyaltyPointHistoryColumns = (): ColumnDef<ILoyaltyPointHistory>[] => {
  const { t } = useTranslation(['loyaltyPoint'])

  return [
    {
      accessorKey: 'date',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('loyaltyPoint.date')} />
      ),
      cell: ({ row }) => {
        const date = row.getValue('date')
        return (
          <div className="text-xs xl:text-sm">
            {date ? moment(date).format('HH:mm DD/MM/YYYY') : ''}
          </div>
        )
      },
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('loyaltyPoint.type')} />
      ),
      cell: ({ row }) => {
        const type = row.original.type
        return (
          <div className="text-xs xl:text-sm">
            {type ? t(`loyaltyPoint.${type}`) : ''}
          </div>
        )
      },
    },
    {
      accessorKey: 'points',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('loyaltyPoint.points')} />
      ),
    },
    {
      accessorKey: 'lastPoints',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('loyaltyPoint.lastPoints')} />
      ),
    },
    {
      accessorKey: 'orderSlug',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('loyaltyPoint.orderSlug')} />
      ),
      cell: ({ row }) => {
        const orderSlug = row.original.orderSlug
        return (
          <div className="text-xs xl:text-sm">
            {orderSlug ? orderSlug : ''}
          </div>
        )
      },
    },
  ]
}