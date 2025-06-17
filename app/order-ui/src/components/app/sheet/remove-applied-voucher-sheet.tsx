import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash2 } from 'lucide-react'

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
import { ConfirmRemoveAppliedVoucherDialog } from '@/components/app/dialog'
import { IRemoveAppliedVoucherRequest, IVoucher } from '@/types'
import { useCatalogs, useProducts } from '@/hooks'
import { useProductColumns } from '@/app/system/voucher/DataTable/columns'
import { ProductFilterOptions } from '@/app/system/dishes/DataTable/actions'

interface IRemoveAppliedVoucherSheetProps {
  voucher: IVoucher
}

export default function RemoveAppliedVoucherSheet({
  voucher,
}: IRemoveAppliedVoucherSheetProps) {
  const { t } = useTranslation(['voucher'])
  const { t: tCommon } = useTranslation(['common'])
  const [isOpen, setIsOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [catalog, setCatalog] = useState<string | null>(null)
  const [removeAppliedVoucherRequest, setRemoveAppliedVoucherRequest] =
    useState<IRemoveAppliedVoucherRequest | null>(null)
  // Separate pagination state for sheet
  const [sheetPagination, setSheetPagination] = useState({
    pageIndex: 1,
    pageSize: 10
  })
  const { data: products, isLoading } = useProducts({
    voucher: voucher?.slug,
    isAppliedVoucher: true,
    page: sheetPagination.pageIndex,
    size: sheetPagination.pageSize,
    hasPaging: true,
    catalog: catalog || undefined,
  }, !!sheetOpen)

  const { data: catalogs } = useCatalogs()

  const productsData = products?.result.items
  const catalogsData = catalogs?.result

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSheetOpen(true)
  }

  const handleSelectionChange = useCallback((selectedSlugs: string[]) => {
    setRemoveAppliedVoucherRequest({
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
          <Trash2 className="icon" />
          {t('voucher.removeAppliedVoucher')}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-3xl">
        <SheetHeader className="p-4">
          <SheetTitle className="text-primary">
            {t('voucher.removeAppliedVoucher')}
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
                  })}
                  data={productsData || []}
                  isLoading={isLoading}
                  pages={products?.result.totalPages || 1}
                  filterOptions={ProductFilterOptions}
                  onPageChange={handleSheetPageChange}
                  onPageSizeChange={handleSheetPageSizeChange}
                  filterConfig={filterConfig}
                  onFilterChange={handleFilterChange}
                />
              </div>
            </div>
          </ScrollArea>
          <SheetFooter className="p-4">
            <ConfirmRemoveAppliedVoucherDialog
              disabled={
                !removeAppliedVoucherRequest || removeAppliedVoucherRequest.products.length === 0
              }
              removeAppliedVoucherData={removeAppliedVoucherRequest}
              isOpen={isOpen}
              onOpenChange={setIsOpen}
              onCloseSheet={() => { setSheetOpen(false) }}
            />
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
