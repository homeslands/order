import { ColumnDef } from '@tanstack/react-table'
import moment from 'moment'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MoreHorizontal, SquareMousePointer } from 'lucide-react'

import {
  Button,
  DataTableColumnHeader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui'
import { IRole } from '@/types'

import { ROUTE } from '@/constants'
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
            {user.name}
          </div>
        )
      },
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('role.description')} />
      ),
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="text-xs sm:text-sm">
            {user?.description}
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: tCommon('common.action'),
      cell: ({ row }) => {
        const role = row.original
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
                <NavLink
                  to={`${ROUTE.STAFF_ROLE_MANAGEMENT}/${role.slug}`}
                  className="flex items-center justify-start w-full"
                >
                  <Button
                    variant="ghost"
                    className="flex justify-start w-full gap-1 px-2 text-sm"
                  >
                    <SquareMousePointer className="icon" />
                    {tCommon('common.viewDetail')}
                  </Button>
                </NavLink>
                <UpdateRoleDialog role={role} />

                {/* <DeleteRoleDialog role={role} /> */}

                {/* <UserInfoDialog user={user} /> */}
                {/* <ResetPasswordDialog user={user} /> */}
                {/* <UpdateUserRoleDialog user={user} /> */}
                {/* <UpdateEmployeeDialog employee={user} /> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}
