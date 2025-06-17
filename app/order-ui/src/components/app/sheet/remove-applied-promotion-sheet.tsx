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
import { RemoveAppliedPromotionDialog } from '@/components/app/dialog'
import { IApplyPromotionRequest, IPromotion } from '@/types'
import { useProducts } from '@/hooks'
import { useProductColumns } from '@/app/system/promotion/DataTable/columns'

interface IApplyPromotionSheetProps {
  promotion: IPromotion
}

export default function RemoveAppliedPromotionSheet({
  promotion,
}: IApplyPromotionSheetProps) {
  const { t } = useTranslation(['promotion'])
  const [isOpen, setIsOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [applyPromotionRequest, setApplyPromotionRequest] =
    useState<IApplyPromotionRequest | null>(null)
  // Separate pagination state for sheet
  const [sheetPagination, setSheetPagination] = useState({
    pageIndex: 1,
    pageSize: 10
  })
  const { data: products, isLoading } = useProducts({
    promotion: promotion?.slug, isAppliedPromotion: true,
    page: sheetPagination.pageIndex,
    size: sheetPagination.pageSize,
    hasPaging: true,
  }, !sheetOpen)

  const productsData = products?.result.items
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSheetOpen(true)
  }

  const handleSelectionChange = useCallback((selectedSlugs: string[]) => {
    setApplyPromotionRequest({
      applicableSlugs: selectedSlugs,
      promotion: promotion?.slug,
      type: 'product',
    })
  }, [promotion?.slug])

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
  return (
    <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="gap-1 justify-start px-2 w-full bg-destructive/10 text-destructive"
          onClick={handleClick}
        >
          <Trash2 className="icon" />
          {t('promotion.removeAppliedPromotion')}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-3xl">
        <SheetHeader className="p-4">
          <SheetTitle className="text-primary">
            {t('promotion.removeAppliedPromotion')}
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
                  onPageChange={handleSheetPageChange}
                  onPageSizeChange={handleSheetPageSizeChange}
                />
              </div>
            </div>
          </ScrollArea>
          <SheetFooter className="p-4">
            <RemoveAppliedPromotionDialog
              disabled={
                !applyPromotionRequest || applyPromotionRequest.applicableSlugs.length === 0
              }
              applyPromotionData={applyPromotionRequest}
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
