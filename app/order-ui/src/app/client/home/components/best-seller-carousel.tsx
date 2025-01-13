import { NavLink } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from '@/components/ui'

import { IProduct } from '@/types'
import { publicFileURL, ROUTE } from '@/constants'
import { SkeletonMenuList } from '@/components/app/skeleton'
import { formatCurrency } from '@/utils'
import { usePagination, useTopBranchProducts } from '@/hooks'
import { useBranchStore } from '@/stores/branch.store'

export default function BestSellerCarousel() {
  const [api, setApi] = useState<CarouselApi>()
  const { t } = useTranslation('menu')
  const [current, setCurrent] = useState(0)
  const { pagination } = usePagination()
  const { branch } = useBranchStore()
  const {
    data: bestSellerProducts,
    isPending,
    refetch,
  } = useTopBranchProducts({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    branch: branch && branch?.slug,
  })

  // Add effect to refetch when branch changes
  useEffect(() => {
    refetch()
  }, [branch, refetch])

  const getPriceRange = (variants: IProduct['variants']) => {
    if (!variants || variants.length === 0) return null

    const prices = variants.map((v) => v.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)

    return {
      min: minPrice,
      max: maxPrice,
      isSinglePrice: minPrice === maxPrice,
    }
  }

  const onSelect = useCallback(() => {
    if (!api) return
    setCurrent(api.selectedScrollSnap())
  }, [api])

  useEffect(() => {
    if (!api) return

    const intervalId = setInterval(() => {
      api.scrollNext()
    }, 50000) // Trượt mỗi 5 giây

    api.on('select', onSelect)

    return () => {
      clearInterval(intervalId)
      api.off('select', onSelect)
    }
  }, [api, onSelect])

  if (isPending || !bestSellerProducts?.result.items) {
    return (
      <div className={`grid grid-cols-2 gap-3 py-4`}>
        {[...Array(2)].map((_, index) => (
          <SkeletonMenuList key={index} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        setApi={setApi}
        className="w-full"
      >
        <CarouselContent>
          {bestSellerProducts.result.items.map((item) => (
            <CarouselItem
              key={item.product.slug}
              className="basis-1/2 lg:basis-1/4 xl:basis-1/5"
            >
              <div className="flex w-full justify-center py-2">
                <NavLink
                  key={item.product.slug}
                  className="block w-full"
                  to={`${ROUTE.CLIENT_MENU}/${item.product.slug}`}
                >
                  <div className="flex min-h-[10rem] w-full flex-col rounded-xl border bg-white backdrop-blur-md transition-all duration-300 hover:scale-105">
                    <div className="relative">
                      {item.product.image ? (
                        <img
                          src={`${publicFileURL}/${item.product.image}`}
                          alt={item.product.name}
                          className="h-36 w-full rounded-t-md object-cover"
                        />
                      ) : (
                        <div className="h-24 w-full rounded-t-md bg-muted/60" />
                      )}
                    </div>

                    <div className="flex flex-1 flex-col space-y-1.5 p-2">
                      <div>
                        <h3 className="line-clamp-1 text-lg font-bold">
                          {item.product.name}
                        </h3>
                        <p className="line-clamp-2 text-xs text-gray-500">
                          {item.product.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-1">
                        <div className="flex flex-col">
                          {item.product.variants.length > 0 ? (
                            <div className="flex flex-col items-start justify-start gap-1">
                              <span className="text-xs font-bold text-primary sm:text-lg">
                                {(() => {
                                  const range = getPriceRange(
                                    item.product.variants,
                                  )
                                  if (!range) return '0đ'
                                  return range.isSinglePrice
                                    ? `${formatCurrency(range.min)}`
                                    : `${formatCurrency(range.min)} - ${formatCurrency(range.max)}`
                                })()}
                              </span>
                              <span className="text-[0.7rem] text-muted-foreground">
                                {t('menu.totalSold')}: {item.totalQuantity}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm font-bold text-primary">
                              {t('menu.contactForPrice')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </NavLink>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="mt-4 flex gap-2">
        {bestSellerProducts.result.items.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full transition-all ${
              current === index ? 'w-4 bg-primary' : 'bg-gray-300'
            }`}
            onClick={() => api?.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  )
}
