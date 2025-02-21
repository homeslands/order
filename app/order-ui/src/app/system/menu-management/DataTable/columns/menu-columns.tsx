import { NavLink } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, SquareMousePointer } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

import {
  Button,
  DataTableColumnHeader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui'
import { IMenu } from '@/types'
import { ROUTE } from '@/constants'
import { DeleteMenuDialog, UpdateMenuDialog } from '@/components/app/dialog'

export const useMenusColumns = (): ColumnDef<IMenu>[] => {
  const { t } = useTranslation(['menu'])
  const { t: tCommon } = useTranslation(['common'])
  return [
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('menu.createdAt')} />
      ),
      cell: ({ row }) => {
        const createdAt = row.getValue('createdAt')
        return createdAt ? moment(createdAt).format('DD/MM/YYYY HH:mm') : ''
      },
    },
    {
      accessorKey: 'date',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('menu.date')} />
      ),
      cell: ({ row }) => {
        const date = row.getValue('date')
        return date ? moment(date).format('DD/MM/YYYY') : ''
      },
    },
    {
      accessorKey: 'dayIndex',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('menu.dayIndex')} />
      ),
      cell: ({ row }) => {
        const dayIndex = row.getValue('dayIndex')
        return dayIndex !== null && dayIndex !== undefined ? tCommon(`dayOfWeek.${dayIndex}`) : tCommon('dayOfWeek.noDayOfWeek')
      },
    },
    {
      accessorKey: 'isTemplate',
      header: () => (
        <div>
          {t('menu.isTemplate')}
        </div>
      ),
      cell: ({ row }) => {
        const isTemplate = row.getValue('isTemplate')
        return isTemplate ? t(`menu.isTemplate`) : t(`menu.noTemplate`)
      },
    },
    {
      accessorKey: 'menuItems',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('menu.totalItems')} />
      ),
      cell: ({ row }) => {
        const menuItems = row.getValue('menuItems') as IMenu['menuItems']
        return menuItems ? menuItems.length : 0
      },
    },
    {
      id: 'actions',
      header: tCommon('common.action'),
      cell: ({ row }) => {
        const menu = row.original
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
                  to={`${ROUTE.STAFF_MENU_MANAGEMENT}/${menu.slug}`}
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
                <UpdateMenuDialog menu={menu} />
                <DeleteMenuDialog menu={menu} />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}
