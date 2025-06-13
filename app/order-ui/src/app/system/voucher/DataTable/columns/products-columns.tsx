import { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import { DataTableColumnHeader, Checkbox } from '@/components/ui'
import { IProduct } from '@/types'
import { publicFileURL } from '@/constants'

interface ProductColumnsProps {
  onSelectionChange?: (selectedSlugs: string[]) => void
  selectedProducts?: string[]
}

export const useProductColumns = ({
  onSelectionChange,
  selectedProducts = [],
}: ProductColumnsProps = {}): ColumnDef<IProduct>[] => {
  const { t } = useTranslation(['product'])

  return [
    {
      id: 'select',
      header: ({ table }) => {
        const currentPageSlugs = table.getRowModel().rows.map(row => row.original.slug)
        const allCurrentPageSelected = currentPageSlugs.length > 0 &&
          currentPageSlugs.every(slug => selectedProducts.includes(slug))

        return (
          <Checkbox
            checked={allCurrentPageSelected}
            onCheckedChange={(value) => {
              const currentPageSlugs = table.getRowModel().rows.map(row => row.original.slug)

              if (value) {
                const newSelectedProducts = [
                  ...selectedProducts.filter(slug => !currentPageSlugs.includes(slug)),
                  ...currentPageSlugs
                ]
                onSelectionChange?.(newSelectedProducts)
                table.setRowSelection(
                  Object.fromEntries(
                    table.getRowModel().rows.map((_, index) => [index, true])
                  )
                )
              } else {
                const newSelectedProducts = selectedProducts.filter(slug => !currentPageSlugs.includes(slug))
                onSelectionChange?.(newSelectedProducts)
                table.setRowSelection({})
              }
            }}
            aria-label="Select all"
          />
        )
      },
      cell: ({ row }) => {
        const product = row.original
        const isSelected = selectedProducts.includes(product.slug)

        return (
          <Checkbox
            checked={isSelected}
            onCheckedChange={(value) => {
              if (value) {
                const newSelectedProducts = [...selectedProducts, product.slug]
                onSelectionChange?.(newSelectedProducts)
              } else {
                const newSelectedProducts = selectedProducts.filter((slug) => slug !== product.slug)
                onSelectionChange?.(newSelectedProducts)
              }
              row.toggleSelected(!!value)
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

