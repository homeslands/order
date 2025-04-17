import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'
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
import { publicFileURL } from '@/constants'
import ProductImage from '@/assets/images/ProductImage.png'
export const useProductColumns = (): ColumnDef<IProduct>[] => {
  const { t } = useTranslation(['product'])
  const { t: tCommon } = useTranslation(['common'])
  return [
    {
      accessorKey: 'image',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('product.image')} />,
      cell: ({ row }) => {
        const image = row.getValue('image') ? `${publicFileURL}/${row.getValue('image')}` : ProductImage
        return (
          <img src={image} alt={row.getValue('image')} className="object-cover w-36 h-28 rounded-md" />
        )
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
          <div className="flex flex-col gap-1">
            <div className="font-bold">{name}</div>
            <p className="overflow-hidden text-sm text-gray-500 break-words line-clamp-3 text-ellipsis">{description}</p>
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
          <div>
            {moment(new Date(createdAt as string)).format('DD/MM/YYYY')}
          </div>
        ) : ''
      }
    },
    {
      accessorKey: 'catalog.name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('product.catalog')} />,
      cell: ({ row }) => {
        const product = row.original
        return product ? <span>{product.catalog.name.charAt(0).toUpperCase() + product.catalog.name.slice(1)}</span> : ''
      }
    },
    {
      accessorKey: 'highlight',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('product.highlight')} />
      ),
      cell: ({ row }) => {
        const { isLimit, isTopSell, isNew } = row.original
        return (
          <div className="flex flex-col gap-1.5 min-w-[8rem] px-2">
            {isLimit && (
              <div className="flex gap-1 justify-center items-center px-2 py-1 text-xs font-bold text-yellow-500 bg-yellow-500 rounded-xl border border-yellow-400 bg-opacity-15">
                ✨ {t('product.isLimited')}
              </div>
            )}
            {isTopSell && (
              <div className="flex gap-1 justify-center items-center px-2 py-1 text-xs font-bold rounded-xl border text-destructive bg-destructive/15 bg-opacity-15 border-destructive">
                🔥 {t('product.isTopSell')}
              </div>
            )}
            {isNew && (
              <div className="flex gap-1 justify-center items-center px-2 py-1 text-xs font-bold text-green-500 bg-green-600 rounded-xl border border-green-500 bg-opacity-15">
                🍃 {t('product.isNew')}
              </div>
            )}
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
                <Button variant="ghost" className="p-0 w-8 h-8">
                  <span className="sr-only">{tCommon('common.action')}</span>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{tCommon('common.action')}</DropdownMenuLabel>
                <div onClick={(e) => e.stopPropagation()}>
                  <UpdateProductDialog product={product} />
                  <DeleteProductDialog product={product} />
                  <UploadProductImageDialog product={product} />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      }
    }
  ]
}
