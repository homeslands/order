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
      header: ({ column }) => (<DataTableColumnHeader column={column} title={t('product.name')} />),
      cell: ({ row }) => {
        const { name, description } = row.original
        return (
          <div className="flex flex-col gap-1 w-[20rem]">
            <div className="font-bold">{name}</div>
            <p className="text-sm text-gray-500 break-words line-clamp-3 text-ellipsis overflow-hidden">{description}</p>
          </div>
        )
      },
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
            {moment(new Date(createdAt as string)).format('DD/MM/YYYY')}
          </div>
        ) : ''
      }
    },
    {
      accessorKey: 'catalog.name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('product.catalog')} />
    },
    {
      accessorKey: 'highlight',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('product.highlight')} />
      ),
      cell: ({ row }) => {
        const { isLimit, isTopSell, isNew } = row.original
        return (
          <div className="flex flex-col gap-2 px-2">
            {isLimit ? (
              <div className="bg-yellow-400 text-yellow-900 rounded-xl text-[11px] text-center font-bold">
                {t('product.isLimited')}
              </div>
            ) : null}
            {isTopSell ? (
              <div className="bg-red-500 text-white rounded-xl text-[11px] text-center font-bold">
                {t('product.isTopSell')}
              </div>
            ) : null}
            {isNew ? (
              <div className="bg-green-500 text-white rounded-xl text-[11px] text-center font-bold">
                {t('product.isNew')}
              </div>
            ) : null}
          </div>
        )
      }
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
