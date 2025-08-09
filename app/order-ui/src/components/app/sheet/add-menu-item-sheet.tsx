import { useCallback, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { PlusCircle } from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  Button,
  ScrollArea,
  SheetTitle,
  DataTable,
  SheetFooter,
} from '@/components/ui'
import { useMenuItemStore } from '@/stores'
import { useCatalogs, usePagination, useProducts } from '@/hooks'
import { AddMultipleItemsDialog } from '../dialog'
import { useProductColumns } from '@/app/system/menu-detail-management/DataTable/columns'
import { IAddMenuItemRequest, IProduct } from '@/types'
import { ProductFilterOptions } from '@/app/system/products/DataTable/actions'
interface IAddMenuItemSheetProps {
  branch: string | undefined
  menuSlug: string | undefined
}

export default function AddMenuItemSheet({ branch, menuSlug }: IAddMenuItemSheetProps) {
  const { t } = useTranslation('menu')
  const { t: tCommon } = useTranslation('common')
  const { getMenuItems, clearMenuItems, addMenuItem } = useMenuItemStore()
  const { pagination, handlePageChange, handlePageSizeChange } = usePagination()
  const [isOpen, setIsOpen] = useState(false)
  const [catalog, setCatalog] = useState<string | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<IProduct[]>([])
  const [productMapping, setProductMapping] = useState<Map<string, IProduct>>(new Map())

  // Separate pagination state for sheet

  const { data: products, isLoading, refetch } = useProducts({
    branch: branch,
    menu: menuSlug,
    inMenu: false,
    isPossibleCreateMenuItemForBranch: true,
    page: pagination.pageIndex,
    size: pagination.pageSize,
    hasPaging: true,
    catalog: catalog || undefined,
  }, !!isOpen)

  const { data: catalogs } = useCatalogs()

  const catalogsData = catalogs?.result
  const productsData = products?.result.items
  const menuItems = getMenuItems()

  // Update product mapping when new products are loaded
  useEffect(() => {
    if (productsData) {
      setProductMapping(prev => {
        const newMapping = new Map(prev)
        productsData.forEach(product => {
          newMapping.set(product.slug, product)
        })
        return newMapping
      })
    }
  }, [productsData])

  const handleSelectionChange = useCallback((selectedProducts: IProduct[]) => {
    setSelectedProducts(selectedProducts)

    // Clear existing items first
    clearMenuItems()

    // Convert selected products to IAddMenuItemRequest and add to store
    selectedProducts.forEach(product => {
      const menuItem: IAddMenuItemRequest = {
        menuSlug: menuSlug || '',
        productSlug: product.slug,
        defaultStock: 1,
        isLimit: false,
        productName: product.name,
      }
      addMenuItem(menuItem)
    })
  }, [menuSlug, clearMenuItems, addMenuItem])

  const filterConfig = [
    {
      id: 'catalog',
      label: t('catalog.title'),
      options: [
        { label: tCommon('dataTable.all'), value: 'all' },
        ...(catalogsData?.map(catalog => ({
          label: catalog.name.charAt(0).toUpperCase() + catalog.name.slice(1),
          value: catalog.slug,
        })) || []),
      ],
    },
  ]

  const handleFilterChange = (filterId: string, value: string) => {
    if (filterId === 'catalog') {
      setCatalog(value === 'all' ? null : value)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      handlePageChange(1)
      refetch()
      clearMenuItems()
      setSelectedProducts([])
      setProductMapping(new Map())
    }
  }

  const handleSubmitSuccess = () => {
    refetch()
    clearMenuItems()
    setSelectedProducts([])
    setProductMapping(new Map())
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild className="fixed right-4 top-20 w-full">
        <Button className="z-50 w-fit">
          <PlusCircle className="icon" />
          {t('menu.addMenuItem')}
        </Button>
      </SheetTrigger>

      <SheetContent className="flex flex-col w-3/4 sm:max-w-3xl">
        <SheetHeader className="p-4 shrink-0">
          <SheetTitle className="text-primary">
            {t('menu.addMenuItem')}
          </SheetTitle>
        </SheetHeader>

        {/* ✅ ScrollArea wrapper: grow để lấp đầy chiều cao còn lại */}
        <div className="overflow-hidden flex-1">
          <ScrollArea className="h-full">
            <div className="grid grid-cols-1 gap-2 p-4">
              <DataTable
                columns={useProductColumns({
                  onSelectionChange: handleSelectionChange,
                  selectedProducts: selectedProducts.map(p => p.slug),
                  productMapping: productMapping,
                })}
                data={productsData || []}
                isLoading={isLoading}
                pages={products?.result.totalPages || 1}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                filterOptions={ProductFilterOptions}
                filterConfig={filterConfig}
                onFilterChange={handleFilterChange}
              />
            </div>
          </ScrollArea>
        </div>

        {/* Footer cố định ở đáy */}
        <SheetFooter className="p-4 shrink-0">
          {menuItems.length > 0 && (
            <div className="flex gap-2 justify-end w-full">
              <Button
                variant="outline"
                className="h-10"
                onClick={() => {
                  clearMenuItems()
                  setSelectedProducts([])
                  setProductMapping(new Map())
                }}
              >
                {tCommon('common.cancel')}
              </Button>
              <AddMultipleItemsDialog onSubmit={handleSubmitSuccess} products={menuItems} />
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>

  )
}
