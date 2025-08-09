import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { PenLine } from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Button,
  ScrollArea,
  SheetFooter,
  DataTable,
} from '@/components/ui'
import { IApplyVoucherRequest, IVoucher } from '@/types'
import { useCatalogs, useProducts } from '@/hooks'
import { useProductColumns } from '@/app/system/voucher/DataTable/columns'
import { ConfirmApplyVoucherDialog } from '@/components/app/dialog'
import { ProductFilterOptions } from '@/app/system/products/DataTable/actions'

interface IApplyVoucherSheetProps {
  voucher: IVoucher
}

export default function ApplyVoucherSheet({
  voucher,
}: IApplyVoucherSheetProps) {
  const { t } = useTranslation(['voucher'])
  const { t: tCommon } = useTranslation(['common'])
  const [isOpen, setIsOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [catalog, setCatalog] = useState<string | null>(null)
  const [applyVoucherRequest, setApplyVoucherRequest] =
    useState<IApplyVoucherRequest | null>(null)

  // Separate pagination state for sheet
  const [sheetPagination, setSheetPagination] = useState({
    pageIndex: 1,
    pageSize: 10
  })

  const { data: products, isLoading } = useProducts({
    voucher: voucher?.slug,
    isAppliedVoucher: false,
    page: sheetPagination.pageIndex,
    size: sheetPagination.pageSize,
    hasPaging: true,
    catalog: catalog || undefined,
  },
    !!sheetOpen
  )

  const { data: catalogs } = useCatalogs()

  const productsData = products?.result.items
  const catalogsData = catalogs?.result

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSheetOpen(true)
  }, [])

  const handleSelectionChange = useCallback((selectedSlugs: string[]) => {
    setApplyVoucherRequest({
      products: selectedSlugs,
      vouchers: [voucher?.slug],
    })
  }, [voucher?.slug])

  const handleSheetPageChange = useCallback((page: number) => {
    setSheetPagination(prev => ({
      ...prev,
      pageIndex: page
    }))
  }, [])

  const handleSheetPageSizeChange = useCallback((size: number) => {
    setSheetPagination(() => ({
      pageIndex: 1, // Reset to first page when changing page size
      pageSize: size
    }))
  }, [])

  const handleSheetOpenChange = useCallback((open: boolean) => {
    setSheetOpen(open)
  }, [])

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

  return (
    <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="gap-1 justify-start px-2 w-full"
          onClick={handleClick}
        >
          <PenLine className="icon" />
          {t('voucher.applyVoucher')}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-3xl">
        <SheetHeader className="p-4">
          <SheetTitle className="text-primary">
            {t('voucher.applyVoucher')}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full bg-transparent backdrop-blur-md">
          <ScrollArea className="max-h-[calc(100vh-8rem)] flex-1 gap-4">
            {/* Product List */}
            <div
              className={`p-4 bg-white rounded-md border dark:bg-transparent`}
            >
              <div className="grid grid-cols-1 gap-2">
                <DataTable
                  columns={useProductColumns({
                    onSelectionChange: handleSelectionChange,
                    selectedProducts: applyVoucherRequest?.products || [],
                  })}
                  data={productsData || []}
                  isLoading={isLoading}
                  pages={products?.result.totalPages || 1}
                  filterOptions={ProductFilterOptions}
                  filterConfig={filterConfig}
                  onFilterChange={handleFilterChange}
                  onPageChange={handleSheetPageChange}
                  onPageSizeChange={handleSheetPageSizeChange}
                />
              </div>
            </div>
          </ScrollArea>
          <SheetFooter className="p-4">
            <ConfirmApplyVoucherDialog
              disabled={
                !applyVoucherRequest || applyVoucherRequest.products.length === 0
              }
              applyVoucherData={applyVoucherRequest}
              isOpen={isOpen}
              onOpenChange={setIsOpen}
              onCloseSheet={() => setSheetOpen(false)}
            />
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
