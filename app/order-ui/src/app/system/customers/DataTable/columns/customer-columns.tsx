import { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import { MoreHorizontal, ShoppingBag } from 'lucide-react'

import {
  Button,
  DataTableColumnHeader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui'
import { IUserInfo } from '@/types'
import {
  ResetPasswordDialog,
  UpdateCustomerDialog,
  UserInfoDialog,
} from '@/components/app/dialog'
import { formatCurrency } from '@/utils'
import { GiftCardTransactionSheet } from '@/components/app/sheet'
import { NavLink } from 'react-router-dom'
import { ROUTE } from '@/constants'

export const useUserListColumns = (): ColumnDef<IUserInfo>[] => {
  const { t } = useTranslation(['customer', 'common'])
  const { t: tCommon } = useTranslation(['common'])
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
      accessorKey: 'points',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('customer.points')} />
      ),
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="text-sm">
            {formatCurrency(user?.balance?.points || 0, ' ')}
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: tCommon('common.action'),
      cell: ({ row }) => {
        const user = row.original
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
                <NavLink to={`${ROUTE.STAFF_CUSTOMER_MANAGEMENT}/${user.slug}/order-history`}>
                  <Button variant="ghost" className="flex gap-1 justify-start px-2 w-full text-sm">
                    <ShoppingBag className="icon" />
                    {t('customer.viewOrders')}
                  </Button>
                </NavLink>
                <UserInfoDialog user={user} />
                <GiftCardTransactionSheet user={user} />
                <ResetPasswordDialog user={user} />
                <UpdateCustomerDialog customer={user} />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}
