import { ColumnDef } from '@tanstack/react-table'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { DataTableColumnHeader, Checkbox } from '@/components/ui'
import { IProduct } from '@/types'
import { publicFileURL } from '@/constants'
import { useMenuItemStore } from '@/stores'

export const useProductColumns = (): ColumnDef<IProduct>[] => {
  const { t } = useTranslation(['product'])
  const { slug: menuSlug } = useParams()
  const { addMenuItem, removeMenuItem, getMenuItems } = useMenuItemStore()

  // Lấy danh sách menuItems từ store
  const menuItems = getMenuItems()

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value)
            const rows = table.getRowModel().rows
            rows.forEach((row) => {
              const product = row.original
              if (value) {
                addMenuItem({
                  menuSlug: menuSlug || '',
                  productName: product.name,
                  productSlug: product.slug,
                  defaultStock: 50,
                  isLimit: product.isLimit
                })
              } else {
                removeMenuItem(product.slug)
              }
            })
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => {
        const product = row.original
        // Kiểm tra xem sản phẩm đã tồn tại trong store chưa
        const isSelected = menuItems.some(
          (item) => item.productSlug === product.slug,
        )

        return (
          <Checkbox
            checked={isSelected} // Sử dụng trạng thái từ store thay vì từ row
            onCheckedChange={(value) => {
              row.toggleSelected(!!value)
              const product = row.original
              if (value) {
                addMenuItem({
                  menuSlug: menuSlug || '',
                  productName: product.name,
                  productSlug: product.slug,
                  defaultStock: 50,
                  isLimit: product.isLimit
                })
              } else {
                removeMenuItem(product.slug)
              }
            }}
            aria-label="Select row"
          />
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    // {
    //   accessorKey: 'actions',
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title={t('product.actions')} />
    //   ),
    //   cell: ({ row }) => {
    //     const product = row.original
    //     return <AddMenuItemDialog product={product} />
    //   },
    // },
    {
      accessorKey: 'image',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('product.image')} />
      ),
      cell: ({ row }) => {
        const image = row.getValue('image')
        return image ? (
          <img
            src={`${publicFileURL}/${image}`}
            className="w-20 rounded-md object-contain"
          />
        ) : null
      },
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('product.name')} />
      ),
    },
    // {
    //   accessorKey: 'slug',
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title={t('product.name')} />
    //   ),
    // },
    {
      accessorKey: 'catalog.name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('product.catalog')} />
      ),
    },
  ]
}
