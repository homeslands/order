import { useState, useEffect } from 'react'
import moment from 'moment'
import { CircleX, MapPinIcon, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useCatalogStore, usePriceRangeStore, useProductNameStore } from '@/stores'
import { useSpecificMenuItem } from '@/hooks'
// import { MenuList } from '../menu'
// import { CurrentDateInput } from '@/components/app/input'
import { PriceRangeFilter } from '@/components/app/popover'
import { useBranchStore } from '@/stores/branch.store'
import { formatCurrency } from '@/utils'

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
  const { productName, setProductName } = useProductNameStore()

  const [filters, setFilters] = useState<FilterState>({
    menu: undefined,
    date: moment().format('YYYY-MM-DD'),
    branch: branch?.slug,
    catalog: catalog?.slug,
    productName: productName,
    minPrice: minPrice,
    maxPrice: maxPrice,
  })

  const { data: specificMenu } = useSpecificMenuItem(filters)

  useEffect(() => {
    setFilters((prev: FilterState) => ({
      ...prev,
      menu: specificMenu?.result?.slug,
      branch: branch?.slug,
      catalog: catalog?.slug,
      productName: productName,
      minPrice: minPrice,
      maxPrice: maxPrice,
    }))
  }, [minPrice, maxPrice, branch?.slug, catalog?.slug, productName, specificMenu?.result?.slug])

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
            <div className="flex items-center w-full gap-2 px-3 py-2 border rounded-lg">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('menu.searchProduct')}
                className="w-full bg-transparent outline-none"
                value={productName || ''}
                onChange={(e) => setProductName(e.target.value)}
              />
              {productName && (
                <CircleX
                  className="w-4 h-4 cursor-pointer text-muted-foreground"
                  onClick={() => setProductName('')}
                />
              )}
            </div>

            {/* Price filter */}
            <div className="flex-shrink-0 w-full sm:w-auto">
              <PriceRangeFilter />
            </div>
            {minPrice !== 0 && maxPrice !== 0 && (
              <div className="flex items-center flex-shrink-0 gap-1 px-2 border rounded-full border-primary bg-primary/10 text-primary">
                <span className="text-xs">{formatCurrency(minPrice)}</span>
                <span className="text-xs">đến</span>
                <span className="text-xs">{formatCurrency(maxPrice)}</span>
                <CircleX onClick={() => clearPriceRange()} />
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-3/4">
          {/* <MenuList menu={specificMenu?.result} isLoading={isLoading} /> */}
        </div>
      </div>
    </div>
  )
}
