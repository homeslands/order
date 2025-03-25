import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PlusCircle } from 'lucide-react'

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
import { ICreateChefAreaProductRequest } from '@/types'
import { useProducts } from '@/hooks'
import { useProductColumns } from '@/app/system/chef-area/DataTable/columns'
import { ConfirmAddChefAreaProductDialog } from '../dialog'

export default function AddProductInChefAreaSheet() {
  const { t } = useTranslation(['chefArea'])
  const [isOpen, setIsOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const { slug } = useParams()
  const [addProductInChefArea, setAddProductInChefArea] =
    useState<ICreateChefAreaProductRequest | null>(null)
  const { data: products, isLoading } = useProducts()

  const productsData = products?.result

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSheetOpen(true)
  }

  const handleSelectionChange = (selectedSlug: string[]) => {
    setAddProductInChefArea({
      chefArea: slug as string,
      product: selectedSlug,
    })
  }
  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button
          className="justify-start gap-1 px-2 w-fit"
          onClick={handleClick}
        >
          <PlusCircle className="icon" />
          {t('chefArea.addProduct')}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-3xl">
        <SheetHeader className="p-4">
          <SheetTitle className="text-primary">
            {t('chefArea.addProduct')}
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
                  pages={1}
                  onPageChange={() => { }}
                  onPageSizeChange={() => { }}
                />
              </div>
            </div>
          </ScrollArea>
          <SheetFooter className="p-4">
            <ConfirmAddChefAreaProductDialog
              disabled={
                !addProductInChefArea || addProductInChefArea.product.length === 0
              }
              productData={addProductInChefArea}
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
