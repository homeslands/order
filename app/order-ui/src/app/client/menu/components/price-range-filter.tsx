import { useEffect, useState } from 'react'
import { CircleXIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Input,
} from '@/components/ui'
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
    <Accordion type="single" collapsible className="text-muted-foreground">
      <AccordionItem value="item-1" className="">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2 cursor-default">
            {t('menu.priceRangeFilter')}
            {minPrice || maxPrice ? (
              <CircleXIcon
                className="w-5 h-5 cursor-pointer hover:text-primary"
                onClick={clearPriceRange}
              />
            ) : null}
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="items-center gap-2 mt-2 flex-between">
            <div className="relative grid items-center grid-cols-5 gap-1">
              <div className="relative w-full col-span-2">
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  className="w-full pr-6" // Thêm padding bên phải để tránh chữ "đ"
                />
                <span className="absolute inset-y-0 flex items-center right-2 text-muted-foreground">
                  đ
                </span>
              </div>
              <span className='flex justify-center col-span-1'>-</span>
              <div className="relative w-full col-span-2">
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="100000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full pr-6" // Thêm khoảng trống bên phải
                />
                <span className="absolute inset-y-0 flex items-center right-2 text-muted-foreground">
                  đ
                </span>
              </div>
            </div>
            <Button onClick={handleApply}>
              {t('menu.apply')}{' '}
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
