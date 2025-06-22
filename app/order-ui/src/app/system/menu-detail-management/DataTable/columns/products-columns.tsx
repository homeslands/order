import { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import { DataTableColumnHeader, Checkbox } from '@/components/ui'
import { IProduct } from '@/types'
import { publicFileURL } from '@/constants'

interface ProductColumnsProps {
  onSelectionChange?: (selectedProducts: IProduct[]) => void
  selectedProducts?: string[]
  productMapping?: Map<string, IProduct>
}

export const useProductColumns = ({
  onSelectionChange,
  selectedProducts = [],
  productMapping = new Map(),
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
              if (value) {
                // Get all current page products
                const currentPageProducts = table.getRowModel().rows.map(row => row.original)
                // Get previously selected products from mapping
                const previouslySelectedProducts = selectedProducts
                  .filter(slug => !currentPageSlugs.includes(slug))
                  .map(slug => productMapping.get(slug))
                  .filter(Boolean) as IProduct[]

                const allSelectedProducts = [...previouslySelectedProducts, ...currentPageProducts]
                onSelectionChange?.(allSelectedProducts)

                table.setRowSelection(
                  Object.fromEntries(
                    table.getRowModel().rows.map((_, index) => [index, true])
                  )
                )
              } else {
                // Remove current page products from selection
                const remainingProducts = selectedProducts
                  .filter(slug => !currentPageSlugs.includes(slug))
                  .map(slug => productMapping.get(slug))
                  .filter(Boolean) as IProduct[]

                onSelectionChange?.(remainingProducts)
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
                // Add product to selection
                const currentSelected = selectedProducts
                  .map(slug => productMapping.get(slug))
                  .filter(Boolean) as IProduct[]
                const newSelectedProducts = [...currentSelected, product]
                onSelectionChange?.(newSelectedProducts)
              } else {
                // Remove product from selection
                const remainingProducts = selectedProducts
                  .filter(slug => slug !== product.slug)
                  .map(slug => productMapping.get(slug))
                  .filter(Boolean) as IProduct[]
                onSelectionChange?.(remainingProducts)
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
