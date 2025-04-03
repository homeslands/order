import { useState, useEffect } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import { DataTableColumnHeader, Checkbox } from '@/components/ui'
import { IProduct } from '@/types'
import { publicFileURL } from '@/constants'

interface ProductColumnsProps {
  onSelectionChange?: (selectedSlugs: string[]) => void
  resetKey?: number
}

export const useProductColumns = ({
  onSelectionChange,
  resetKey = 0,
}: ProductColumnsProps = {}): ColumnDef<IProduct>[] => {
  const { t } = useTranslation(['product'])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  useEffect(() => {
    setSelectedProducts([])
  }, [resetKey])

  const updateSelectedProducts = (updatedSlugs: string[]) => {
    // clear selectedProducts
    setSelectedProducts([])
    // Ensure all items are strings and remove duplicates
    // const validSlugs = [...new Set(updatedSlugs.filter((slug): slug is string =>
    //   typeof slug === 'string' && slug.length > 0
    // ))]
    setSelectedProducts(updatedSlugs)
    onSelectionChange?.(updatedSlugs)
  }

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value)
            const rows = table.getRowModel().rows
            const updatedSlugs = value
              ? rows.map((row) => String(row.original.slug))
              : []
            updateSelectedProducts(updatedSlugs)
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => {
        const product = row.original
        return (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value)
              updateSelectedProducts(
                value ? [...selectedProducts, product.slug] : selectedProducts.filter((slug) => slug !== product.slug)
              )
            }}
            aria-label="Select row"
          />
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
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
            className="object-contain w-20 rounded-md"
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
    {
      accessorKey: 'catalog.name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('product.catalog')} />
      ),
    },
  ]
}

