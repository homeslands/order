import { CircleXIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Input,
  Label,
} from '@/components/ui'
import { useEffect, useState } from 'react'
import { usePriceRangeStore } from '@/stores'

export const PriceRangeFilter = () => {
  const { t } = useTranslation(['menu'])
  const {
    setPriceRange,
    minPrice: storedMinPrice,
    maxPrice: storedMaxPrice,
    clearPriceRange,
  } = usePriceRangeStore()
  const [minPrice, setMinPrice] = useState<number>(storedMinPrice)
  const [maxPrice, setMaxPrice] = useState<number>(storedMaxPrice)

  useEffect(() => {
    setMinPrice(storedMinPrice)
    setMaxPrice(storedMaxPrice)
  }, [storedMinPrice, storedMaxPrice])

  const handleApply = () => {
    const min = Number(minPrice) || 0
    const max = Number(maxPrice) || 0
    setPriceRange(min, max)
  } // Lưu giá trị vào store

  return (
    <Accordion type="single" collapsible className="">
      <AccordionItem value="item-1" className="">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2 cursor-default">
            {t('menu.priceRangeFilter')}
            <CircleXIcon
              className="w-5 h-5 cursor-pointer hover:text-primary"
              onClick={clearPriceRange}
            />
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="items-center gap-2 mt-2 flex-between">
            <div className="flex items-center gap-1">
              <Input
                id="minPrice"
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                className="w-2/3"
              />
              <Label htmlFor="minPrice">đ</Label>
            </div>
            <span>-</span>
            <div className="flex items-center justify-end gap-1">
              <Input
                id="maxPrice"
                type="number"
                placeholder="100000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-2/3"
              />
              <Label htmlFor="minPrice">đ</Label>
            </div>
            <Button onClick={handleApply} className="mt-2">
              {t('menu.apply')}{' '}
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
