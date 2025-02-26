import moment from 'moment'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import { Button, DataTableColumnHeader, DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui'
import { ITable } from '@/types'
import { TableStatus } from '@/constants'
import { MoreHorizontal } from 'lucide-react'
import { DeleteTableDialog, UpdateTableDialog, UpdateTableStatusDialog } from '@/components/app/dialog'

export const useTableColumns = (): ColumnDef<ITable>[] => {
  const { t } = useTranslation(['table'])
  const { t: tCommon } = useTranslation(['common'])

  return [
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('table.createdAt')} />
      ),
      cell: ({ row }) => {
        const createdAt = row.getValue('createdAt')
        return createdAt !== null && createdAt !== undefined
          ? moment(createdAt).format('hh:mm DD/MM/YYYY')
          : t('table.noData')
      }
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('table.name')} />
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('table.status')} />
      ),
      cell: ({ row }) => {
        const table = row.original;
        const status = table?.status;

        return (
          <div
            className={`text-xs sm:text-sm min-w-[8rem] italic font-medium ${status === TableStatus.AVAILABLE ? ' text-green-500' : ' text-destructive'
              }`}
          >
            {status === TableStatus.AVAILABLE ? t('table.available') : t('table.reserved')}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: tCommon('common.action'),
      cell: ({ row }) => {
        const table = row.original
        return (
          <div className='w-[4rem]'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-8 h-8 p-0">
                  <span className="sr-only">{tCommon('common.action')}</span>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {tCommon('common.action')}
                </DropdownMenuLabel>
                <UpdateTableDialog table={table} />
                <UpdateTableStatusDialog table={table} />
                <DeleteTableDialog table={table} />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}
