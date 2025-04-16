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
import { IRole } from '@/types'

import { UpdateRoleDialog } from '@/components/app/dialog'

export const useRoleListColumns = (): ColumnDef<IRole>[] => {
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
      accessorKey: 'slug',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('role.slug')} />
      ),
      cell: ({ row }) => {
        const user = row.original
        return <div className="text-xs sm:text-sm">{user?.slug}</div>
      },
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('role.name')} />
      ),
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="text-xs sm:text-sm">
            {t(`role.${user.name}`)}
          </div>
        )
      },
    },
    // {
    //   accessorKey: 'description',
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title={t('role.description')} />
    //   ),
    //   cell: ({ row }) => {
    //     const user = row.original
    //     return (
    //       <div className="text-xs sm:text-sm">
    //         {user?.description}
    //       </div>
    //     )
    //   },
    // },
    {
      id: 'actions',
      header: tCommon('common.action'),
      cell: ({ row }) => {
        const role = row.original
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
                <div onClick={(e) => e.stopPropagation()} className="flex flex-col gap-2">
                  <UpdateRoleDialog role={role} />
                </div>
                {/* <DeleteRoleDialog role={role} /> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}
