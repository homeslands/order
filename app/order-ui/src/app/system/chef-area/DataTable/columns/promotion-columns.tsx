import { ColumnDef } from '@tanstack/react-table'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { MoreHorizontal } from 'lucide-react'

import {
  Button,
  DataTableColumnHeader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui'
import { IPromotion } from '@/types'
import { ApplyPromotionSheet, RemoveAppliedPromotionSheet, UpdatePromotionSheet } from '@/components/app/sheet'
import { DeletePromotionDialog } from '@/components/app/dialog'

export const usePromotionColumns = (): ColumnDef<IPromotion>[] => {
  const { t } = useTranslation(['promotion'])
  const { t: tCommon } = useTranslation(['common'])

  return [
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('promotion.createdAt')} />
      ),
      cell: ({ row }) => {
        const createdAt = row.getValue('createdAt')
        return (
          <div className="text-xs sm:text-sm">
            {createdAt ? moment(createdAt).format('HH:mm DD/MM/YYYY') : ''}
          </div>
        )
      },
    },
    {
      accessorKey: 'slug',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('promotion.slug')} />
      ),
      cell: ({ row }) => {
        const user = row.original
        return <div className="text-xs sm:text-sm">{user?.slug}</div>
      },
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('promotion.title')} />
      ),
      cell: ({ row }) => {
        const promotion = row.original
        return (
          <div className="flex flex-col gap-1 text-xs sm:text-sm">
            {promotion?.title}
            <span className="text-xs text-muted-foreground">
              {promotion.description}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'startDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('promotion.time')} />
      ),
      cell: ({ row }) => {
        const promotion = row.original
        return <div>
          <div className="text-xs sm:text-sm">{moment(promotion.startDate).format('DD/MM/YYYY')} - {moment(promotion.endDate).format('DD/MM/YYYY')}</div>
        </div>
      },
    },
    {
      accessorKey: 'value',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('promotion.value')} />
      ),
      cell: ({ row }) => {
        const promotion = row.original
        return <div>
          <div className="text-xs sm:text-sm">{promotion?.value}%</div>
        </div>
      },
    },
    {
      id: 'actions',
      header: tCommon('common.action'),
      cell: ({ row }) => {
        const promotion = row.original
        return (
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-8 h-8 p-0">
                  <span className="sr-only">{tCommon('common.action')}</span>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className='flex flex-col gap-2'>
                <DropdownMenuLabel>
                  {tCommon('common.action')}
                </DropdownMenuLabel>
                <UpdatePromotionSheet promotion={promotion} />
                <ApplyPromotionSheet promotion={promotion} />
                <RemoveAppliedPromotionSheet promotion={promotion} />
                <DeletePromotionDialog promotion={promotion} />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}
