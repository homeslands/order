import moment from 'moment'
import { NavLink } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, SquareMousePointer } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Button,
  DataTableColumnHeader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui'
import { IBanner } from '@/types'
import { DeleteBannerDialog } from '@/components/app/dialog'

import { ROUTE } from '@/constants'

export const useBannerColumns = (): ColumnDef<IBanner>[] => {
  const { t } = useTranslation(['banner'])
  const { t: tCommon } = useTranslation(['common'])
  return [
    {
      accessorKey: 'slug',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('banner.slug')} />
      ),
      cell: ({ row }) => {
        const slug = row.getValue('slug')
        return slug !== null && slug !== undefined ? slug : tCommon('banner.noData')
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('banner.createdAt')} />
      ),
      cell: ({ row }) => {
        const createdAt = row.getValue('createdAt')
        return createdAt !== null && createdAt !== undefined ? moment(createdAt).format('hh:mm DD/MM/YYYY') : tCommon('banner.noData')
      },
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('banner.title')} />
      ),
      cell: ({ row }) => {
        const title = row.getValue('title')
        return title !== null && title !== undefined ? title : tCommon('banner.noData')
      },
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('banner.isActive')} />
      ),
      cell: ({ row }) => {
        const isActive = row.getValue('isActive')
        return isActive === true ? <span className='italic text-green-500'>{t('banner.active')}</span> : <span className='italic text-destructive'>{t('banner.inactive')}</span>
      },
    },
    // {
    //   accessorKey: 'content',
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title={t('banner.content')} />
    //   ),
    //   cell: ({ row }) => {
    //     const content = row.getValue('content')
    //     return content !== null && content !== undefined ? content : tCommon('banner.noData')
    //   },
    // },
    {
      id: 'actions',
      header: tCommon('common.action'),
      cell: ({ row }) => {
        const banner = row.original
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
                <NavLink to={`${ROUTE.ADMIN_BANNER}/${banner.slug}`}>
                  <Button variant="ghost" className="flex justify-start gap-1 px-2">
                    <SquareMousePointer className='icon' />
                    {tCommon('common.viewAndEdit')}
                  </Button>
                </NavLink>
                <DeleteBannerDialog banner={banner} />
                {/* <DeleteBranchDialog branch={branch} /> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}
