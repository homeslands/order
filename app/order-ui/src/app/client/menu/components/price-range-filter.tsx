import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui'

import { usePriceRangeStore } from '@/stores'
import { DualRangeSlider } from './dual-range-slider'
import { formatCurrency } from '@/utils'
import { PriceRange } from '@/constants'

export const PriceRangeFilter = () => {
  const { t } = useTranslation(['menu'])
  const {
    setPriceRange,
    minPrice: storedMinPrice,
    maxPrice: storedMaxPrice,
  } = usePriceRangeStore()
  const [minPrice, setMinPrice] = useState<number>(storedMinPrice ?? PriceRange.MIN_PRICE)
  const [maxPrice, setMaxPrice] = useState<number>(storedMaxPrice ?? PriceRange.MAX_PRICE)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setMinPrice(storedMinPrice ?? PriceRange.MIN_PRICE)
    setMaxPrice(storedMaxPrice ?? PriceRange.MAX_PRICE)
  }, [storedMinPrice, storedMaxPrice])

  const handleApply = () => {
    const min = Number(minPrice) || 0
    const max = Number(maxPrice) || 0
    setPriceRange(min, max)
    setOpen(false)
  }

  const handleSliderChange = (values: number[]) => {
    const [min, max] = values
    // Allow crossing values - if min > max, swap them
    if (min > max) {
      setMinPrice(max)
      setMaxPrice(min)
    } else {
      setMinPrice(min)
      setMaxPrice(max)
    }
  }

  const handleInputChange = (value: number, type: 'min' | 'max') => {
    const validValue = Math.max(PriceRange.MIN_PRICE, Math.min(value, PriceRange.MAX_PRICE))

    if (type === 'min') {
      // Allow setting min higher than max - they will swap
      setMinPrice(validValue)
      if (validValue > maxPrice) {
        setMaxPrice(validValue)
        setMinPrice(maxPrice)
      }
    } else {
      // Allow setting max lower than min - they will swap
      setMaxPrice(validValue)
      if (validValue < minPrice) {
        setMinPrice(validValue)
        setMaxPrice(minPrice)
      }
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {t('menu.priceRangeFilter')}

        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(PriceRange.MIN_PRICE)}</span>
              <span>{formatCurrency(PriceRange.MAX_PRICE)}</span>
            </div>
            <DualRangeSlider
              min={PriceRange.MIN_PRICE}
              max={PriceRange.MAX_PRICE}
              step={PriceRange.STEP_SIZE}
              value={[minPrice, maxPrice]}
              onValueChange={handleSliderChange}
            // minStepsBetweenThumbs={0} // Allow thumbs to cross
            />

            <div className="relative grid items-center grid-cols-5 gap-1">
              <div className="relative w-full col-span-2">
                <Input
                  type="number"
                  min={PriceRange.MIN_PRICE}
                  max={maxPrice}
                  step={PriceRange.STEP_SIZE}
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => handleInputChange(Number(e.target.value), 'min')}
                  className="w-full pr-6"
                />
                <span className="absolute inset-y-0 flex items-center right-2 text-muted-foreground">
                  đ
                </span>
              </div>
              <span className='flex justify-center col-span-1'>→</span>
              <div className="relative w-full col-span-2">
                <Input
                  type="number"
                  min={minPrice}
                  max={PriceRange.MAX_PRICE}
                  step={PriceRange.STEP_SIZE}
                  placeholder="10000000"
                  value={maxPrice}
                  onChange={(e) => handleInputChange(Number(e.target.value), 'max')}
                  className="w-full pr-6"
                />
                <span className="absolute inset-y-0 flex items-center right-2 text-muted-foreground">
                  đ
                </span>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              {t('menu.cancel')}
            </Button>
            <Button onClick={handleApply} className="w-24">
              {t('menu.apply')}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
