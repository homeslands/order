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
import { formatCurrency, formatCurrencyWithSymbol } from '@/utils'
import { PriceRange } from '@/constants'
import { cn } from '@/lib'

export const PriceRangeFilter = () => {
  const { t } = useTranslation(['menu'])
  const {
    setPriceRange,
    minPrice: storedMinPrice,
    maxPrice: storedMaxPrice,
  } = usePriceRangeStore()
  const [minPrice, setMinPrice] = useState<number>(storedMinPrice ?? PriceRange.MIN_PRICE)
  const [maxPrice, setMaxPrice] = useState<number>(storedMaxPrice ?? PriceRange.MAX_PRICE)
  const [minPriceInput, setMinPriceInput] = useState<string>(formatCurrencyWithSymbol(minPrice, false))
  const [maxPriceInput, setMaxPriceInput] = useState<string>(formatCurrencyWithSymbol(maxPrice, false))

  const [open, setOpen] = useState(false)

  const presets = [
    { label: '< 40K', min: PriceRange.MIN_PRICE, max: 40000 },
    { label: '40K – 60K', min: 40000, max: 60000 },
    { label: '60K – 80K', min: 60000, max: 80000 },
    { label: '> 80K', min: 80000, max: PriceRange.MAX_PRICE },
  ]

  const isPresetActive = (min: number, max: number) => {
    return minPrice === min && maxPrice === max
  }



  const handleMinPriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\./g, '')
    const number = Number(raw)

    if (!isNaN(number)) {
      setMinPrice(number)
      setMinPriceInput(formatCurrencyWithSymbol(number, false)) // gán lại chuỗi đã format
    } else {
      setMinPriceInput('') // nếu bị xóa hết
    }
  }

  const handleMaxPriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\./g, '')
    const number = Number(raw)

    if (!isNaN(number)) {
      setMaxPrice(number)
      setMaxPriceInput(formatCurrencyWithSymbol(number, false)) // gán lại chuỗi đã format
    } else {
      setMaxPriceInput('') // nếu bị xóa hết
    }
  }


  const handlePresetClick = (min: number, max: number) => {
    setMinPrice(min)
    setMaxPrice(max)
    setMinPriceInput(formatCurrencyWithSymbol(min, false))
    setMaxPriceInput(formatCurrencyWithSymbol(max, false))
  }

  const handleReset = () => {
    setMinPrice(PriceRange.MIN_PRICE)
    setMinPriceInput(formatCurrencyWithSymbol(PriceRange.MIN_PRICE, false))
    setMaxPrice(PriceRange.MIN_PRICE)
    setMaxPriceInput(formatCurrencyWithSymbol(PriceRange.MIN_PRICE, false))
    // Reset store values
    setPriceRange(PriceRange.MIN_PRICE, PriceRange.MAX_PRICE)
    // setOpen(false)
  }

  useEffect(() => {
    setMinPrice(storedMinPrice ?? PriceRange.MIN_PRICE)
    setMaxPrice(storedMaxPrice ?? PriceRange.MAX_PRICE)

    setMinPriceInput(formatCurrencyWithSymbol(storedMinPrice ?? PriceRange.MIN_PRICE, false))
    setMaxPriceInput(formatCurrencyWithSymbol(storedMaxPrice ?? PriceRange.MAX_PRICE, false))

  }, [storedMinPrice, storedMaxPrice])

  const handleApply = () => {
    let min = Number(minPrice) || PriceRange.MIN_PRICE
    let max = Number(maxPrice) || PriceRange.MAX_PRICE

    // Nếu người dùng nhập lệch, hoán đổi trước khi lưu vào store
    if (min > max) {
      [min, max] = [max, min]
    }

    setPriceRange(min, max)
    setOpen(false)
  }


  const handleSliderChange = (values: number[]) => {
    const [min, max] = values
    // Allow crossing values - if min > max, swap them
    if (min > max) {
      setMinPrice(max)
      setMaxPrice(min)
      setMinPriceInput(formatCurrencyWithSymbol(max, false))
      setMaxPriceInput(formatCurrencyWithSymbol(min, false))
    } else {
      setMinPrice(min)
      setMaxPrice(max)
      setMinPriceInput(formatCurrencyWithSymbol(min, false))
      setMaxPriceInput(formatCurrencyWithSymbol(max, false))
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {t('menu.priceRangeFilter')}

        </Button>
      </PopoverTrigger>
      <PopoverContent className="mt-6 w-80">
        <div className="space-y-6">
          <div className="space-y-4">
            <DualRangeSlider
              min={PriceRange.MIN_PRICE}
              max={PriceRange.MAX_PRICE}
              step={PriceRange.STEP_SIZE}
              value={[minPrice, maxPrice]}
              onValueChange={handleSliderChange}
              formatValue={(value) => formatCurrency(value)}
              hideMinMaxLabels={true}
            // minStepsBetweenThumbs={0} // Allow thumbs to cross
            />

            <div className="relative grid items-center grid-cols-5 gap-1">
              <div className="relative w-full col-span-2">
                <Input
                  type="text"
                  inputMode="numeric"
                  value={minPriceInput || '0'}
                  onFocus={(e) => {
                    if (e.target.value === '0') e.target.value = ''
                  }}
                  onChange={handleMinPriceInputChange}
                  placeholder="0"
                  className="w-full pr-6"
                />


                <span className="absolute inset-y-0 flex items-center right-2 text-muted-foreground">
                  đ
                </span>
              </div>

              <span className='flex justify-center col-span-1'>→</span>
              <div className="relative w-full col-span-2">
                <Input
                  type="text"
                  inputMode="numeric"
                  value={maxPriceInput || '0'}
                  onFocus={(e) => {
                    if (e.target.value === '0') e.target.value = ''
                  }}
                  onChange={handleMaxPriceInputChange}
                  placeholder="0"
                  className="w-full pr-6"
                />

                <span className="absolute inset-y-0 flex items-center right-2 text-muted-foreground">
                  đ
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                size="sm"
                variant="ghost"
                onClick={() => handlePresetClick(preset.min, preset.max)}
                className={cn(
                  'text-xs border',
                  isPresetActive(preset.min, preset.max) && 'border-primary bg-primary/10 text-primary'
                )}
              >
                {preset.label}
              </Button>

            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleReset}>
              {t('menu.reset')}
            </Button>
            {/* <Button variant="outline" onClick={() => setOpen(false)}>
              {t('menu.cancel')}
            </Button> */}
            <Button onClick={handleApply} className="w-24">
              {t('menu.apply')}
            </Button>

          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
