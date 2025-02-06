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
  DropdownMenuTrigger
} from '@/components/ui'
import { IProduct } from '@/types'
import {
  UpdateProductDialog,
  DeleteProductDialog,
  UploadProductImageDialog
} from '@/components/app/dialog'
import { publicFileURL, ROUTE } from '@/constants'

export const useProductColumns = (): ColumnDef<IProduct>[] => {
  const { t } = useTranslation(['product'])
  const { t: tCommon } = useTranslation(['common'])
  return [
    {
      accessorKey: 'image',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('product.image')} />,
      cell: ({ row }) => {
        const image = row.getValue('image')
        return image ? (
          <img src={`${publicFileURL}/${image}`} className="object-contain w-32 rounded-md" />
        ) : null
      }
    },
    {
      accessorKey: 'slug',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('product.slug')} />
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('product.name')} />
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('product.createdAt')} />
      ),
      cell: ({ row }) => {
        const createdAt = row.getValue('createdAt')
        return createdAt ? (
          <div className="text-xs">
            {moment(new Date(createdAt as string)).format('HH:mm DD/MM/YYYY')}
          </div>
        ) : ''
      }
    },
    {
      accessorKey: 'catalog.name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('product.catalog')} />
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('product.description')} />
      )
    },
    {
      id: 'actions',
      header: ({ column }) => <DataTableColumnHeader column={column} title={tCommon('common.action')} />,
      cell: ({ row }) => {
        const product = row.original
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
                <DropdownMenuLabel>{tCommon('common.action')}</DropdownMenuLabel>
                <NavLink
                  to={`${ROUTE.STAFF_PRODUCT_MANAGEMENT}/${product.slug}`}
                  className="flex items-center justify-start w-full"
                >
                  <Button variant="ghost" className="flex justify-start w-full gap-1 px-2 text-sm">
                    <SquareMousePointer className="icon" />
                    {tCommon('common.viewDetail')}
                  </Button>
                </NavLink>
                <UpdateProductDialog product={product} />
                <DeleteProductDialog product={product} />
                <UploadProductImageDialog product={product} />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      }
    }
  ]
}
