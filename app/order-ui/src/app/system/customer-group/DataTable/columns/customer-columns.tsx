import moment from 'moment'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import {
  DataTableColumnHeader,
  Checkbox,
} from '@/components/ui'

import { IUserInfo } from '@/types'

export const useUserListColumns = (onSelectionChange: (selectedSlugs: IUserInfo[]) => void, selectedUsers: IUserInfo[]): ColumnDef<IUserInfo>[] => {
  const { t } = useTranslation(['customer'])

  const updateSelectedUsers = (updatedSlugs: IUserInfo[]) => {
    onSelectionChange?.(updatedSlugs)
  }
  return [
    {
      id: 'select',
      header: ({ table }) => {
        const isAllSelected = selectedUsers.length === table.getRowModel().rows.length && selectedUsers.length > 0
        return (
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={(value) => {
              const rows = table.getRowModel().rows
              const updatedSlugs = value ? rows.map((row) => row.original) : []
              updateSelectedUsers(updatedSlugs)
            }}
            aria-label="Select all"
          />
        )
      },
      cell: ({ row }) => {
        const user = row.original
        const isSelected = selectedUsers.some(v => v.slug === user.slug)
        return (
          <Checkbox
            checked={isSelected}
            onCheckedChange={(value) => {
              if (value) {
                updateSelectedUsers([...selectedUsers, user])
              } else {
                updateSelectedUsers(selectedUsers.filter((v) => v.slug !== user.slug))
              }
            }}
            aria-label="Select row"
          />
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
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
  ]
}
