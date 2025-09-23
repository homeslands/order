import { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

import {
  DataTableColumnHeader,
} from '@/components/ui'
import { ILoyaltyPointHistory } from '@/types'
import { LoyaltyPointTypeBadge } from '@/components/app/badge'
import { LoyaltyPointHistoryType } from '@/constants'
import { formatPoints } from '@/utils'

export const useLoyaltyPointHistoryColumns = (): ColumnDef<ILoyaltyPointHistory>[] => {
  const { t } = useTranslation(['profile'])
  return [
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('profile.points.createdAt')} />
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
      accessorKey: 'points',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('profile.points.points')} />
      ),
      cell: ({ row }) => {
        const loyaltyPointHistory = row.original
        return (
          <div className="text-sm">
            {formatPoints(loyaltyPointHistory?.points)}
          </div>
        )
      },
    },
    {
      accessorKey: 'lastPoints',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('profile.points.lastPoints')} />
      ),
      cell: ({ row }) => {
        const loyaltyPointHistory = row.original
        return <div className="text-sm">{formatPoints(loyaltyPointHistory?.lastPoints)}</div>
      },
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('profile.points.type')} />
      ),
      cell: ({ row }) => {
        const loyaltyPointHistory = row.original
        return <div className="text-sm"><LoyaltyPointTypeBadge type={loyaltyPointHistory?.type as LoyaltyPointHistoryType} /></div>
      },
    },
    {
      accessorKey: 'orderSlug',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('profile.points.orderSlug')} />
      ),
      cell: ({ row }) => {
        const loyaltyPointHistory = row.original
        return <div className="text-sm">{loyaltyPointHistory?.orderSlug}</div>
      },
    },
  ]
}
