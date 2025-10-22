import moment from 'moment'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import { DataTableColumnHeader, Checkbox } from '@/components/ui'
import { IUserGroup } from '@/types'

interface UserGroupColumnsProps {
  onSelectionChange?: (selectedSlugs: string[]) => void
  selectedUserGroups?: string[]
}

export const useUserGroupColumns = ({
  onSelectionChange,
  selectedUserGroups = [],
}: UserGroupColumnsProps = {}): ColumnDef<IUserGroup>[] => {
  const { t } = useTranslation(['customer'])

  return [
    {
      id: 'select',
      header: ({ table }) => {
        const currentPageSlugs = table.getRowModel().rows.map(row => row.original.slug)
        const allCurrentPageSelected = currentPageSlugs.length > 0 &&
          currentPageSlugs.every(slug => selectedUserGroups.includes(slug))

        return (
          <Checkbox
            checked={allCurrentPageSelected}
            onCheckedChange={(value) => {
              const currentPageSlugs = table.getRowModel().rows.map(row => row.original.slug)

              if (value) {
                const newSelectedUserGroups = [
                  ...selectedUserGroups.filter(slug => !currentPageSlugs.includes(slug)),
                  ...currentPageSlugs
                ]
                onSelectionChange?.(newSelectedUserGroups)
                table.setRowSelection(
                  Object.fromEntries(
                    table.getRowModel().rows.map((_, index) => [index, true])
                  )
                )
              } else {
                const newSelectedUserGroups = selectedUserGroups.filter(slug => !currentPageSlugs.includes(slug))
                onSelectionChange?.(newSelectedUserGroups)
                table.setRowSelection({})
              }
            }}
            aria-label="Select all"
          />
        )
      },
      cell: ({ row }) => {
        const userGroup = row.original
        const isSelected = selectedUserGroups.includes(userGroup.slug)

        return (
          <Checkbox
            checked={isSelected}
            onCheckedChange={(value) => {
              if (value) {
                const newSelectedUserGroups = [...selectedUserGroups, userGroup.slug]
                onSelectionChange?.(newSelectedUserGroups)
              } else {
                const newSelectedUserGroups = selectedUserGroups.filter((slug) => slug !== userGroup.slug)
                onSelectionChange?.(newSelectedUserGroups)
              }
              row.toggleSelected(!!value)
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
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('customer.userGroup.description')} />
      ),
    },
  ]
}

