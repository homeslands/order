import { useState } from 'react'
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
import { usePagination, useProducts } from '@/hooks'
import { AddMultipleItemsDialog } from '../dialog'
import { useProductColumns } from '@/app/system/order-history/DataTable/columns'
interface IAddMenuItemSheetProps {
  branch: string | undefined
  menuSlug: string | undefined
}

export default function AddMenuItemSheet({ branch, menuSlug }: IAddMenuItemSheetProps) {
  const { t } = useTranslation('menu')
  const { t: tCommon } = useTranslation('common')
  const { getMenuItems, clearMenuItems } = useMenuItemStore()
  const { pagination } = usePagination()
  const { data: products, isLoading, refetch } = useProducts({
    branch: branch,
    menu: menuSlug,
    inMenu: false,
    isPossibleCreateMenuItemForBranch: true,
    page: pagination.pageIndex,
    size: pagination.pageSize,
    hasPaging: true,
  }, !!pagination.pageIndex)
  const [isOpen, setIsOpen] = useState(false)
  const productsData = products?.result.items
  const menuItems = getMenuItems()
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      refetch()
      clearMenuItems()
    }
  }

  const handleSubmitSuccess = () => {
    refetch()
    clearMenuItems()
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild className='fixed right-4 top-20 w-full'>
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
            <div className="flex flex-col gap-5 items-start lg:flex-row">
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
                    <div className="flex gap-2 justify-end mt-4">
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
