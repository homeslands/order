import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import { DataTableColumnHeader, Checkbox } from '@/components/ui'
import { IProduct } from '@/types'
import { publicFileURL } from '@/constants'

interface ProductColumnsProps {
  onSelectionChange?: (selectedSlugs: string[]) => void
}

export const useProductColumns = ({
  onSelectionChange,
}: ProductColumnsProps = {}): ColumnDef<IProduct>[] => {
  const { t } = useTranslation(['product'])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  const updateSelectedProducts = (updatedSlugs: string[]) => {
    // Ensure all items are strings
    const validSlugs = updatedSlugs.filter((slug): slug is string =>
      typeof slug === 'string' && slug.length > 0
    );
    setSelectedProducts(validSlugs);
    onSelectionChange?.(validSlugs);
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
              const productSlug = String(product.slug)
              updateSelectedProducts(
                value
                  ? [...selectedProducts, productSlug]
                  : selectedProducts.filter(slug => slug !== productSlug)
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

