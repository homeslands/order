import { useState, useEffect } from 'react'
import moment from 'moment'
import { CircleX, MapPinIcon, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useCatalogStore, usePriceRangeStore, useBranchStore } from '@/stores'
import { useDebouncedInput, useSpecificMenu } from '@/hooks'
import { PriceRangeFilter } from '@/components/app/popover'
import { formatCurrency } from '@/utils'
import MenuList from './menu-list'
import { Input } from '@/components/ui'
import { ClientCatalogSelect } from '@/components/app/select'

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
    <div className="container my-10">
      <div className="flex flex-col items-start gap-5 lg:flex-row">
        {/* Left - sidebar */}
        <div className="w-full lg:sticky lg:top-20 lg:z-10 lg:w-1/4">
          <div className="flex flex-col gap-4">
            {/* Title */}
            <div className="flex items-center w-full gap-1">
              {/* <CurrentDateInput menu={specificMenu?.result} /> */}
            </div>
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
            <div>
              <ClientCatalogSelect onChange={handleSelectCatalog} />
            </div>

            {/* Price filter */}
            <div className="flex-shrink-0 w-fit">
              <PriceRangeFilter />
            </div>
            {minPrice !== 0 && maxPrice !== 0 && (
              <div className="flex items-center flex-shrink-0 gap-1 px-2 py-1 border rounded-full w-fit border-primary bg-primary/10 text-primary">
                <span className="text-xs">{formatCurrency(minPrice)}</span>
                <span className="text-xs">đến</span>
                <span className="text-xs">{formatCurrency(maxPrice)}</span>
                <CircleX className='cursor-pointer' onClick={() => clearPriceRange()} />
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-3/4">
          <MenuList menu={specificMenu?.result} isLoading={isPending} />
        </div>
      </div>
    </div>
  )
}

