import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Button,
  DataTableColumnHeader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui'
import { IBranch } from '@/types'
import { DeleteBranchDialog, UpdateBranchDialog } from '@/components/app/dialog'

export const useBranchesColumns = (): ColumnDef<IBranch>[] => {
  const { t } = useTranslation(['branch'])
  const { t: tCommon } = useTranslation(['common'])
  return [
    {
      accessorKey: 'slug',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('branch.slug')} />
      ),
      cell: ({ row }) => {
        const slug = row.getValue('slug')
        return slug !== null && slug !== undefined ? slug : tCommon('branch.noData')
      },
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('branch.branchName')} />
      ),
      cell: ({ row }) => {
        const name = row.getValue('name')
        return name !== null && name !== undefined ? name : tCommon('branch.noData')
      },
    },
    {
      accessorKey: 'address',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('branch.branchAddress')} />
      ),
      cell: ({ row }) => {
        const address = row.getValue('address')
        return address !== null && address !== undefined ? address : tCommon('branch.noData')
      },
    },
    {
      id: 'actions',
      header: tCommon('common.action'),
      cell: ({ row }) => {
        const branch = row.original
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
                <UpdateBranchDialog branch={branch} />
                <DeleteBranchDialog branch={branch} />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}
