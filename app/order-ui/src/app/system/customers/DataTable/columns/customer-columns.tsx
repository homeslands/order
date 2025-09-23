import moment from 'moment'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import {
  Button,
  DataTableColumnHeader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui'
import { IUserInfo } from '@/types'
import { MoreHorizontal } from 'lucide-react'

export const useUserListColumns = (): ColumnDef<IUserInfo>[] => {
  const { t } = useTranslation(['customer'])
  const { t: tCommon } = useTranslation('common')
  return [
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('customer.createdAt')} />
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
      accessorKey: 'slug',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('customer.slug')} />
      ),
      cell: ({ row }) => {
        const user = row.original
        return <div className="text-sm">{user?.slug}</div>
      },
    },
    {
      accessorKey: 'fullname',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('customer.name')} />
      ),
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="text-sm">
            {user?.firstName} {user?.lastName}
          </div>
        )
      },
    },
    {
      accessorKey: 'phoneNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('customer.phoneNumber')} />
      ),
      cell: ({ row }) => {
        const user = row.original
        return <div className="text-sm">{user?.phonenumber}</div>
      },
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('customer.email')} />
      ),
      cell: ({ row }) => {
        const user = row.original
        return <div className="text-sm">{user?.email}</div>
      },
    },
    {
      id: 'actions',
      header: tCommon('common.action'),
      cell: () => {
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}
