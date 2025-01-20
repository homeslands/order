import moment from 'moment'
import { ColumnDef } from '@tanstack/react-table'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MoreHorizontal, SquareMousePointer } from 'lucide-react'

import { DataTableColumnHeader, DropdownMenu, DropdownMenuTrigger, Button, DropdownMenuContent, DropdownMenuLabel } from '@/components/ui'
import { IStaticPage } from '@/types'
import { ROUTE } from '@/constants'
import { DeleteStaticPageDialog } from '@/components/app/dialog'

export const useStaticPageColumns = (): ColumnDef<IStaticPage>[] => {
  const { t } = useTranslation(['staticPage'])
  const { t: tCommon } = useTranslation(['common'])

  return [
    {
      accessorKey: 'slug',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('staticPage.slug')} />
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('staticPage.createdAt')} />
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
      accessorKey: 'key',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('staticPage.key')} />
      ),
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('staticPage.title')} />
      ),
    },
    {
      id: 'actions',
      header: tCommon('common.action'),
      cell: ({ row }) => {
        const staticPage = row.original
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
                <NavLink to={`${ROUTE.STAFF_STATIC_PAGE}/${staticPage.key}`}>
                  <Button variant="ghost" className="flex justify-start gap-1 px-2">
                    <SquareMousePointer className='icon' />
                    {tCommon('common.viewAndEdit')}
                  </Button>
                </NavLink>
                <DeleteStaticPageDialog staticPage={staticPage} />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}
