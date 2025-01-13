import { useState, useEffect } from 'react'
import moment from 'moment'
import { CircleX, MapPinIcon, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useCatalogStore, usePriceRangeStore, useBranchStore } from '@/stores'
import { useDebouncedInput, useSpecificMenu } from '@/hooks'
import { PriceRangeFilter } from '@/components/app/popover'
import { formatCurrency } from '@/utils'
import { Input } from '@/components/ui'
import { ClientCatalogSelect } from '@/components/app/select'
import { Menus } from './components'

interface FilterState {
  menu?: string
  date: string
  branch?: string
  catalog?: string
  productName?: string
  minPrice?: number
  maxPrice?: number
}

export default function MenuPage() {
  const { t } = useTranslation('menu')
  const { minPrice, maxPrice, clearPriceRange } = usePriceRangeStore()
  const { branch } = useBranchStore()
  const { catalog } = useCatalogStore()
  const { inputValue, setInputValue, debouncedInputValue } = useDebouncedInput() // debounce 500ms

  const [filters, setFilters] = useState<FilterState>({
    date: moment().format('YYYY-MM-DD'),
    branch: branch?.slug,
    catalog: catalog?.slug,
    productName: '',
    minPrice: minPrice,
    maxPrice: maxPrice,
  })

  const { data: specificMenu, isPending } = useSpecificMenu(filters)

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

  return (
    <div className="container py-10">
      <div className="flex flex-col items-start gap-5 lg:flex-row">
        {/* Left - sidebar */}
        <div className="w-full lg:sticky lg:top-20 lg:z-10 lg:w-1/4">
          <div className="flex flex-col gap-4">
            <div className="flex items-end gap-1 text-xs text-primary">
              <MapPinIcon className="h-5 w-5" />
              {branch ? `${branch.name} (${branch.address})` : t('menu.noData')}
            </div>
            {/* Product name search */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('menu.searchProduct')}
                className="w-full bg-transparent pl-10 pr-10"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              {inputValue && (
                <CircleX
                  className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-primary"
                  onClick={() => setInputValue('')}
                />
              )}
            </div>
            {/* Catalog filter */}
            <ClientCatalogSelect onChange={handleSelectCatalog} />
            {/* Price filter */}
            <div className="flex items-center gap-2">
              <div className="w-fit">
                <PriceRangeFilter />
              </div>
              {minPrice !== 0 && maxPrice !== 0 && (
                <div className="flex w-fit items-center gap-1 rounded-full border border-primary bg-primary/10 px-2 py-1 text-primary">
                  <span className="text-xs">{formatCurrency(minPrice)}</span>
                  <span className="text-xs">đến</span>
                  <span className="text-xs">{formatCurrency(maxPrice)}</span>
                  <CircleX
                    className="cursor-pointer"
                    onClick={() => clearPriceRange()}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-3/4">
          <Menus menu={specificMenu?.result} isLoading={isPending} />
        </div>
      </div>
    </div>
  )
}
