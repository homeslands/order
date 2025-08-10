import { useEffect } from 'react'
import moment from 'moment';
import { CircleXIcon, MapPinIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Helmet } from "react-helmet";

import { useBranchStore, useMenuFilterStore } from '@/stores'
import { useSpecificMenu } from '@/hooks'
import { ClientCatalogSelect, HorizontalCatalogSelect } from '@/components/app/select'
import { ClientMenus } from './components'
import ProductNameSearch from './components/product-name-search'
import PriceRangeFilter from './components/price-range-filter'
import { formatCurrency } from '@/utils';
import { FILTER_VALUE } from '@/constants';
import { IMenuFilter, ISpecificMenuRequest } from '@/types';

export default function ClientMenuPage() {
  const { t } = useTranslation(['menu'])
  const { t: tHelmet } = useTranslation('helmet')
  const { menuFilter, setMenuFilter } = useMenuFilterStore()
  const { branch } = useBranchStore()

  const mapMenuFilterToRequest = (filter: IMenuFilter): ISpecificMenuRequest => {
    return {
      date: filter.date,
      branch: filter.branch,
      catalog: filter.catalog,
      productName: filter.productName,
      minPrice: filter.minPrice,
      maxPrice: filter.maxPrice,
      slug: filter.menu,
    }
  }

  const { data: specificMenu, isPending } = useSpecificMenu(mapMenuFilterToRequest(menuFilter))

  useEffect(() => {
    setMenuFilter(prev => {
      const next = { ...prev }
      let changed = false

      // sync branch
      if (branch?.slug && prev.branch !== branch.slug) {
        next.branch = branch.slug
        changed = true
      }

      // sync date
      const today = moment().format('YYYY-MM-DD')
      if (prev.date !== today) {
        next.date = today
        changed = true
      }

      return changed ? next : prev
    })
  }, [branch?.slug, setMenuFilter])

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuFilter(prev => ({ ...prev, minPrice: FILTER_VALUE.MIN_PRICE, maxPrice: FILTER_VALUE.MAX_PRICE, branch: branch?.slug }))
  }

  return (
    <div className="container py-4 sm:py-10">
      <Helmet>
        <meta charSet='utf-8' />
        <title>
          {tHelmet('helmet.menu.title')}
        </title>
        <meta name='description' content={tHelmet('helmet.menu.title')} />
      </Helmet>
      <div className="flex flex-col gap-5 items-start lg:flex-row">
        {/* Left - sidebar */}
        <div className="w-full lg:sticky lg:top-24 lg:z-10 lg:w-1/4">
          <div className="flex flex-col gap-2">
            <div className="flex gap-1 justify-center py-2 text-xs text-primary">
              <MapPinIcon className="w-4 h-4" />
              {branch ? `${branch.name} (${branch.address})` : t('menu.noData')}
            </div>
            {/* Product name search */}
            <ProductNameSearch />
            {/* Catalog filter */}
            <div className='hidden sm:block'>
              <ClientCatalogSelect />
            </div>
            <div className='block sm:hidden'>
              <HorizontalCatalogSelect />
            </div>

            {/* Price filter */}
            <PriceRangeFilter />
            {(menuFilter.minPrice > FILTER_VALUE.MIN_PRICE || menuFilter.maxPrice < FILTER_VALUE.MAX_PRICE) && (
              <div className="flex gap-2 justify-center px-2 py-2 text-sm rounded-xl border border-primary bg-primary/5 text-primary">
                <div>
                  {formatCurrency(menuFilter.minPrice)} - {formatCurrency(menuFilter.maxPrice)}
                </div>
                <CircleXIcon
                  className="w-5 h-5 cursor-pointer hover:text-primary"
                  onClick={handleClear}
                />
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-3/4">
          <ClientMenus menu={specificMenu?.result} isLoading={isPending} />
        </div>
      </div>
    </div>
  )
}
