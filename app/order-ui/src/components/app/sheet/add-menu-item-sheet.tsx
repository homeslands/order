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
} from '@/components/ui'
import { useMenuItemStore } from '@/stores'
import { useProducts } from '@/hooks'
import { AddMultipleItemsDialog } from '../dialog'
import { useProductColumns } from '@/app/system/order-history/DataTable/columns'

interface IAddMenuItemSheetProps {
  menuSlug: string | undefined
}


export default function AddMenuItemSheet({ menuSlug }: IAddMenuItemSheetProps) {
  const { t } = useTranslation('menu')
  const { t: tCommon } = useTranslation('common')
  const { getMenuItems, clearMenuItems } = useMenuItemStore()
  const { data: products, isLoading, refetch } = useProducts({
    menu: menuSlug,
    inMenu: false,
  })

  const productsData = products?.result
  const menuItems = getMenuItems()

  const handleSubmitSuccess = () => {
    refetch()
    clearMenuItems()
  }

  return (
    <Sheet>
      <SheetTrigger asChild className='fixed w-full right-4 top-20'>
        <Button className='z-50 w-fit'>
          <PlusCircle className="icon" />
          {t('menu.addMenuItem')}
        </Button>
      </SheetTrigger>
      <SheetContent className='w-3/4 sm:max-w-3xl'>
        <SheetHeader className="p-4">
          <SheetTitle className="text-primary">
            {t('menu.addMenuItem')}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full bg-transparent backdrop-blur-md">
          <ScrollArea className="max-h-[calc(100vh-4rem)] flex-1 px-4">
            <div className="flex flex-col items-start gap-5 lg:flex-row">
              <div className="w-full">
                <div className="bg-transparent backdrop-blur-md">
                  {/* Product List */}
                  <div className="grid grid-cols-1 gap-2 overflow-y-auto h-[calc(94vh-8rem)]">
                    <DataTable
                      columns={useProductColumns()}
                      data={productsData || []}
                      isLoading={isLoading}
                      pages={1}
                      onPageChange={() => { }}
                      onPageSizeChange={() => { }}
                    />
                  </div>

                  {/* Hiển thị nút thêm khi có items được chọn */}
                  {menuItems.length > 0 && (
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" className='h-10' onClick={() => clearMenuItems()}>
                        {tCommon('common.cancel')}
                      </Button>
                      <AddMultipleItemsDialog onSubmit={handleSubmitSuccess} products={menuItems} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}
