import moment from 'moment'
import { ColumnDef } from '@tanstack/react-table'
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
import { IUserGroup } from '@/types'
import { DeleteUserGroupDialog, UpdateUserGroupDialog } from '@/components/app/dialog'

export const useUserGroupListColumns = (): ColumnDef<IUserGroup>[] => {
  const { t } = useTranslation(['customer'])
  const { t: tCommon } = useTranslation('common')
  return [
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('customer.userGroup.createdAt')} />
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
      accessorKey: 'createdBy',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('customer.userGroup.createdBy')} />
      ),
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="text-sm">
            {user?.createdBy?.firstName} {user?.createdBy?.lastName}
          </div>
        )
      },
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('customer.userGroup.name')} />
      ),
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="text-sm">
            {user?.name}
          </div>
        )
      },
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('customer.userGroup.description')} />
      ),
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="text-sm">
            {user?.description}
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: tCommon('common.action'),
      cell: ({ row }) => {
        const userGroup = row.original
        return (
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 w-8 h-8">
                  <span className="sr-only">{tCommon('common.action')}</span>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className='flex flex-col gap-1'>
                <DropdownMenuLabel>
                  {tCommon('common.action')}
                </DropdownMenuLabel>
                <div onClick={(e) => e.stopPropagation()}>
                  <UpdateUserGroupDialog userGroup={userGroup} />
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <DeleteUserGroupDialog userGroup={userGroup} />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}
