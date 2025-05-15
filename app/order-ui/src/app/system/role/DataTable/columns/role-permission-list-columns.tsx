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
import { IPermission } from '@/types'
import { DeletePermissionDialog } from '@/components/app/dialog'

interface IRolePermissionListColumnsProps {
  onSuccess?: () => void;
}

export const useRolePermissionListColumns = (
  { onSuccess }: IRolePermissionListColumnsProps
): ColumnDef<IPermission>[] => {
  const { t } = useTranslation(['role'])
  const { t: tCommon } = useTranslation(['common'])
  return [
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('role.createdAt')} />
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
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('role.authority')} />
      ),
      cell: ({ row }) => {
        const permission = row.original
        return (
          <div className="text-xs sm:text-sm">
            {permission?.authority.name}
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: tCommon('common.action'),
      cell: ({ row }) => {
        const permission = row.original
        return (
          <div>
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
                <DeletePermissionDialog
                  permission={permission}
                  onSuccess={() => {
                    // Ensure onSuccess exists before calling
                    onSuccess?.()
                  }}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}
