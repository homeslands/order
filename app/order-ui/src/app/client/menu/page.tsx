import { useState, useEffect } from 'react'
import moment from 'moment'
import { MapPinIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Helmet } from "react-helmet";

import { useCatalogStore, usePriceRangeStore, useBranchStore } from '@/stores'
import { useDebouncedInput, useSpecificMenu } from '@/hooks'
import { ClientCatalogSelect } from '@/components/app/select'
import { ClientMenus } from './components'
import { ProductNameSearch } from './components/product-name-search'
import { PriceRangeFilter } from './components/price-range-filter'

interface FilterState {
  menu?: string
  date: string
  branch?: string
  catalog?: string
  productName?: string
  minPrice?: number
  maxPrice?: number
}

export default function ClientMenuPage() {
  const { t } = useTranslation(['menu'])
  const { t: tHelmet } = useTranslation('helmet')
  const { minPrice, maxPrice } = usePriceRangeStore()
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
      productName: debouncedInputValue,
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
      <Helmet>
        <meta charSet='utf-8' />
        <title>
          {tHelmet('helmet.menu.title')}
        </title>
        <meta name='description' content={tHelmet('helmet.menu.title')} />
      </Helmet>
      <div className="flex flex-col items-start gap-5 lg:flex-row">
        {/* Left - sidebar */}
        <div className="w-full lg:sticky lg:top-20 lg:z-10 lg:w-1/4">
          <div className="flex flex-col gap-4">
            <div className="flex items-end gap-1 text-xs text-primary">
              <MapPinIcon className="w-5 h-5" />
              {branch ? `${branch.name} (${branch.address})` : t('menu.noData')}
            </div>
            {/* Product name search */}
            <ProductNameSearch
              inputValue={inputValue}
              setInputValue={setInputValue}
            />
            {/* Catalog filter */}
            <ClientCatalogSelect onChange={handleSelectCatalog} />

            {/* Price filter */}
            <PriceRangeFilter />
          </div>
        </div>

        <div className="w-full lg:w-3/4">
          <ClientMenus menu={specificMenu?.result} isLoading={isPending} />
        </div>
      </div>
    </div>
  )
}
