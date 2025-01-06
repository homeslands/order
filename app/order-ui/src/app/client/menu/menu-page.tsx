import { useState, useEffect } from 'react'
import moment from 'moment'
import { CircleX, MapPinIcon } from 'lucide-react'

import { usePriceRangeStore } from '@/stores'
import { useSpecificMenu } from '@/hooks'
import { MenuList } from '../menu'
import { CurrentDateInput } from '@/components/app/input'
import { PriceRangeFilter } from '@/components/app/popover'
import { useBranchStore } from '@/stores/branch.store'
import { formatCurrency } from '@/utils'
import { useTranslation } from 'react-i18next'

export default function MenuPage() {
  const { t } = useTranslation('menu')
  const { minPrice, maxPrice, clearPriceRange } = usePriceRangeStore()
  const { branch } = useBranchStore()
  const [filters, setFilters] = useState({
    date: moment().format('YYYY-MM-DD'),
    branch: branch?.slug,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
  })

  const { data: specificMenu, isLoading } = useSpecificMenu(filters)

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      branch: branch?.slug,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
    }))
  }, [minPrice, maxPrice, branch?.slug])

  return (
    <div className="container my-10">
      <div className="flex flex-col items-start gap-5 lg:flex-row">
        {/* Left - sidebar */}
        <div className="w-full lg:sticky lg:top-20 lg:z-10 lg:w-1/4">
          <div className="flex flex-col gap-4">
            {/* Title */}
            <div className="flex items-center w-full gap-1">
              <CurrentDateInput menu={specificMenu?.result} />
            </div>
            <div className="flex items-end gap-1 text-xs text-primary">
              <MapPinIcon className="w-5 h-5" />
              {branch ? `${branch.name} (${branch.address})` : t('menu.noData')}
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
          <MenuList menu={specificMenu?.result} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}
