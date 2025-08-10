import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui'

import { useBranchStore, useMenuFilterStore } from '@/stores'
import { DualRangeSlider } from './dual-range-slider'
import { formatCurrency, formatCurrencyWithSymbol } from '@/utils'
import { FILTER_VALUE } from '@/constants'
import { cn } from '@/lib'

export default function PriceRangeFilter() {
  const { t } = useTranslation(['menu'])
  const { branch } = useBranchStore()
  const { menuFilter, setMenuFilter } = useMenuFilterStore()
  const [minPriceInput, setMinPriceInput] = useState<string>(formatCurrencyWithSymbol(menuFilter.minPrice, false))
  const [maxPriceInput, setMaxPriceInput] = useState<string>(formatCurrencyWithSymbol(menuFilter.maxPrice, false))
  const [open, setOpen] = useState(false)

  const presets = [
    { label: '< 40K', min: FILTER_VALUE.MIN_PRICE, max: 40000 },
    { label: '40K – 60K', min: 40000, max: 60000 },
    { label: '60K – 80K', min: 60000, max: 80000 },
    { label: '> 80K', min: 80000, max: FILTER_VALUE.MAX_PRICE },
  ]

  const isPresetActive = (min: number, max: number) => {
    return menuFilter.minPrice === min && menuFilter.maxPrice === max
  }

  const handleMinPriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\./g, '')
    const number = Number(raw)

    if (!isNaN(number)) {
      setMinPriceInput(formatCurrencyWithSymbol(number, false))
    } else {
      setMinPriceInput('')
    }
  }

  const handleMaxPriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\./g, '')
    const number = Number(raw)

    if (!isNaN(number)) {
      setMaxPriceInput(formatCurrencyWithSymbol(number, false))
    } else {
      setMaxPriceInput('')
    }
  }


  const handlePresetClick = (min: number, max: number) => {
    setMenuFilter(prev => ({ ...prev, minPrice: min, maxPrice: max, branch: branch?.slug }))
    setMinPriceInput(formatCurrencyWithSymbol(min, false))
    setMaxPriceInput(formatCurrencyWithSymbol(max, false))
  }

  const handleReset = () => {
    setMenuFilter(prev => ({ ...prev, minPrice: FILTER_VALUE.MIN_PRICE, maxPrice: FILTER_VALUE.MAX_PRICE, branch: branch?.slug }))
    setMinPriceInput(formatCurrencyWithSymbol(FILTER_VALUE.MIN_PRICE, false))
    setMaxPriceInput(formatCurrencyWithSymbol(FILTER_VALUE.MAX_PRICE, false))
  }

  const handleApply = () => {
    const minValue = Number(minPriceInput.replace(/\./g, '')) || FILTER_VALUE.MIN_PRICE
    const maxValue = Number(maxPriceInput.replace(/\./g, '')) || FILTER_VALUE.MAX_PRICE

    // Nếu người dùng nhập lệch, hoán đổi trước khi lưu vào store
    const min = Math.min(minValue, maxValue)
    const max = Math.max(minValue, maxValue)

    setMenuFilter(prev => ({ ...prev, minPrice: min, maxPrice: max }))
    setOpen(false)
  }

  const handleSliderChange = (values: number[]) => {
    const [min, max] = values
    setMinPriceInput(formatCurrencyWithSymbol(min, false))
    setMaxPriceInput(formatCurrencyWithSymbol(max, false))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex gap-2 items-center">
          {t('menu.priceRangeFilter')}

        </Button>
      </PopoverTrigger>
      <PopoverContent className="mt-6 w-80">
        <div className="space-y-6">
          <div className="space-y-4">
            <DualRangeSlider
              min={FILTER_VALUE.MIN_PRICE}
              max={FILTER_VALUE.MAX_PRICE}
              step={1000}
              value={[menuFilter.minPrice, menuFilter.maxPrice]}
              onValueChange={handleSliderChange}
              formatValue={(value) => formatCurrency(value)}
              hideMinMaxLabels={true}
            />

            <div className="grid relative grid-cols-5 gap-1 items-center">
              <div className="relative col-span-2 w-full">
                <Input
                  type="text"
                  inputMode="numeric"
                  value={minPriceInput || '0'}
                  onFocus={(e) => {
                    if (e.target.value === '0') e.target.value = ''
                  }}
                  onChange={handleMinPriceInputChange}
                  placeholder="0"
                  className="pr-6 w-full"
                />


                <span className="flex absolute inset-y-0 right-2 items-center text-muted-foreground">
                  đ
                </span>
              </div>

              <span className='flex col-span-1 justify-center'>→</span>
              <div className="relative col-span-2 w-full">
                <Input
                  type="text"
                  inputMode="numeric"
                  value={maxPriceInput || '0'}
                  onFocus={(e) => {
                    if (e.target.value === '0') e.target.value = ''
                  }}
                  onChange={handleMaxPriceInputChange}
                  placeholder="0"
                  className="pr-6 w-full"
                />

                <span className="flex absolute inset-y-0 right-2 items-center text-muted-foreground">
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

          <div className="flex gap-2 justify-end">
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
