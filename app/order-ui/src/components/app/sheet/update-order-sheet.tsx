import moment from 'moment'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CircleX, MapPinIcon, Search } from 'lucide-react'

import {
  Sheet,
  SheetHeader,
  SheetTrigger,
  Button,
  ScrollArea,
  Input,
  SheetTitle,
  LeftSheetContent,
} from '@/components/ui'
import { useBranchStore, useCatalogStore, usePriceRangeStore } from '@/stores'
import { useDebouncedInput, useSpecificMenu } from '@/hooks'
import { FilterState } from '@/types'
import { formatCurrency } from '@/utils'
import { ClientCatalogSelect } from '../select'
import { PriceRangeFilter } from '@/app/client/menu/components/price-range-filter'
import { MenusInUpdateOrder } from '@/app/client/menu/components/menus-in-update-order'

interface CheckoutCartSheetProps {
  onAddNewOrderItemSuccess: () => void
}

export default function CheckoutCartSheet({ onAddNewOrderItemSuccess }: CheckoutCartSheetProps) {
  const { t } = useTranslation('menu')
  const { inputValue, setInputValue, debouncedInputValue } = useDebouncedInput()
  const { minPrice, maxPrice, clearPriceRange } = usePriceRangeStore()
  const { branch } = useBranchStore()
  const { catalog } = useCatalogStore()
  useEffect(() => {
    setFilters((prev: FilterState) => ({
      ...prev,
      branch: branch?.slug,
      catalog: catalog?.slug,
      productName: debouncedInputValue, // sử dụng giá trị debounce
      minPrice: minPrice,
      maxPrice: maxPrice,
    }))
  }, [minPrice, maxPrice, branch?.slug, catalog?.slug, debouncedInputValue])

  const handleSelectCatalog = (catalog: string) => {
    setFilters((prev: FilterState) => ({
      ...prev,
      catalog: catalog,
    }))
  }
  const [filters, setFilters] = useState<FilterState>({
    date: moment().format('YYYY-MM-DD'),
    branch: branch?.slug,
    catalog: catalog?.slug,
    productName: '',
    minPrice: minPrice,
    maxPrice: maxPrice,
  })
  const { data: specificMenu, isPending } = useSpecificMenu(filters)

  return (
    <Sheet>
      <SheetTrigger asChild className='fixed w-full left-4 top-20'>
        <Button className='z-50 w-fit'>
          {t('order.openMenu')}
        </Button>
      </SheetTrigger>
      <LeftSheetContent className='w-5/6 sm:max-w-4xl'>
        <SheetHeader className="p-4">
          <SheetTitle className="text-primary">
            {t('order.menu')}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full bg-transparent backdrop-blur-md">
          {/* Cart Items */}
          <ScrollArea className="max-h-[calc(100vh-8rem)] flex-1 px-4">
            <div className="flex flex-col items-start gap-5 lg:flex-row">
              {/* Left - sidebar */}
              <div className="sticky w-full lg:sticky lg:top-3 lg:z-10 lg:w-1/4">
                <div className="flex flex-col gap-4">
                  <div className="flex items-end gap-1 text-xs text-primary">
                    <MapPinIcon className="w-5 h-5" />
                    {branch ? `${branch.name} (${branch.address})` : t('menu.noData')}
                  </div>
                  {/* Product name search */}
                  <div className="relative w-full">
                    <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={t('menu.searchProduct')}
                      className="w-full pl-10 pr-10 bg-transparent"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                    />
                    {inputValue && (
                      <CircleX
                        className="absolute w-4 h-4 -translate-y-1/2 cursor-pointer right-3 top-1/2 text-muted-foreground hover:text-primary"
                        onClick={() => setInputValue('')}
                      />
                    )}
                  </div>
                  {/* Catalog filter */}
                  <ClientCatalogSelect onChange={handleSelectCatalog} />
                  {/* Price filter */}
                  <div className="flex flex-col items-center justify-start w-full gap-2">
                    <div className="w-full">
                      <PriceRangeFilter />
                    </div>
                    {minPrice !== 0 && maxPrice !== 0 && (
                      <div className='flex justify-start w-full'>
                        <div className="flex items-center gap-1 px-2 py-1 border rounded-full w-fit border-primary bg-primary/10 text-primary">
                          <span className="text-xs">{formatCurrency(minPrice)}</span>
                          <span className="text-xs">đến</span>
                          <span className="text-xs">{formatCurrency(maxPrice)}</span>
                          <CircleX
                            className="cursor-pointer"
                            onClick={() => clearPriceRange()}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="w-full mt-4 lg:w-3/4">
                <MenusInUpdateOrder onAddNewOrderItemSuccess={onAddNewOrderItemSuccess} menu={specificMenu?.result} isLoading={isPending} />
              </div>
            </div>
          </ScrollArea>
        </div>
      </LeftSheetContent>
    </Sheet>
  )
}
