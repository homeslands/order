import { useState } from 'react'
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
  Label,
  Switch,
} from '@/components/ui'
import { ConfirmApplyPromotionDialog } from '@/components/app/dialog'
import { IApplyPromotionRequest, IProduct, IPromotion } from '@/types'
import { useProducts } from '@/hooks'
import { useProductColumns } from '@/app/system/promotion/DataTable/columns'

interface IApplyPromotionSheetProps {
  promotion: IPromotion
}

export default function ApplyPromotionSheet({
  promotion,
}: IApplyPromotionSheetProps) {
  const { t } = useTranslation(['promotion'])
  const [isOpen, setIsOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [applyPromotionRequest, setApplyPromotionRequest] =
    useState<IApplyPromotionRequest | null>(null)
  const { data: products, isLoading } = useProducts(promotion?.slug)
  const [isApplyFromToday, setIsApplyFromToday] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  const productsData = products?.result

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSheetOpen(true)
  }

  const handleProductSelect = (product: IProduct, isSelected: boolean) => {
    setSelectedProducts((prev) => {
      if (isSelected) {
        return [...prev, product.slug]
      }
      return prev.filter((slug) => slug !== product.slug)
    })

    const applyPromotionRequest: IApplyPromotionRequest = {
      applicableSlugs: isSelected
        ? [...selectedProducts, product.slug]
        : selectedProducts.filter((slug) => slug !== product.slug),
      promotion: promotion?.slug,
      type: 'product',
      isApplyFromToday: isApplyFromToday || true,
    }
    setApplyPromotionRequest(applyPromotionRequest)
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="justify-start w-full gap-1 px-2"
          onClick={handleClick}
        >
          <PenLine className="icon" />
          {t('promotion.applyPromotion')}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-3xl">
        <SheetHeader className="p-4">
          <SheetTitle className="text-primary">
            {t('promotion.applyPromotion')}
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
                    onSelect: (product, isSelected) =>
                      handleProductSelect(product, isSelected),
                  })}
                  data={productsData || []}
                  isLoading={isLoading}
                  pages={1}
                  onPageChange={() => { }}
                  onPageSizeChange={() => { }}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-applied-from-today"
                  checked={isApplyFromToday}
                  onCheckedChange={setIsApplyFromToday}
                />
                <Label htmlFor="is-applied-from-today">
                  {t('promotion.applyFromToday')}
                </Label>
              </div>
            </div>
          </ScrollArea>
          <SheetFooter className="p-4">
            <ConfirmApplyPromotionDialog
              disabled={
                !applyPromotionRequest || !applyPromotionRequest.applicableSlugs
              }
              applyPromotionData={applyPromotionRequest}
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
