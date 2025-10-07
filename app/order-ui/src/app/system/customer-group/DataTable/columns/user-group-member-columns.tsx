import moment from 'moment'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { Eye, MoreHorizontal } from 'lucide-react'

import {
  Button,
  DataTableColumnHeader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui'
import { IUserGroupMember } from '@/types'
import { DeleteUserGroupMemberDialog } from '@/components/app/dialog'
import { NavLink } from 'react-router-dom'
import { ROUTE } from '@/constants'

export const useUserGroupMemberListColumns = (): ColumnDef<IUserGroupMember>[] => {
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
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('customer.name')} />
      ),
      cell: ({ row }) => {
        const user = row.original
        return <div className="text-sm">{user?.user?.firstName} {user?.user?.lastName}</div>
      },
    },
    {
      accessorKey: 'phoneNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('customer.phoneNumber')} />
      ),
      cell: ({ row }) => {
        const user = row.original
        return <div className="text-sm">{user?.user?.phonenumber}</div>
      },
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('customer.email')} />
      ),
      cell: ({ row }) => {
        const user = row.original
        return <div className="text-sm">{user?.user?.email}</div>
      },
    },
    {
      accessorKey: 'createdBy',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('customer.userGroup.createdBy')} />
      ),
      cell: ({ row }) => {
        const user = row.original
        return <div className="text-sm">{user?.createdBy?.firstName} {user?.createdBy?.lastName}</div>
      },
    },
    {
      id: 'actions',
      header: tCommon('common.action'),
      cell: ({ row }) => {
        const userGroupMember = row.original
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
                <NavLink to={`${ROUTE.STAFF_CUSTOMER_MANAGEMENT}/${userGroupMember?.user?.slug}`}>
                  <Button variant="ghost" className="flex gap-1 justify-start px-2 w-full">
                    <Eye className="w-4 h-4" />
                    {tCommon('common.viewDetail')}
                  </Button>
                </NavLink>
                <DeleteUserGroupMemberDialog userGroupMember={userGroupMember} />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}
